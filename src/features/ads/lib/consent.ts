import { Platform } from 'react-native';
import mobileAds, {
  AdsConsent,
  AdsConsentStatus,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { env, TEST_DEVICE_IDS } from '@/shared/config';
import { setAdsConsentProperties } from '@/shared/analytics';

/**
 * AdMob startup sequence. Runs UMP → ATT → SDK.initialize() in the order
 * required by Google AdMob policy:
 *
 *   1. UMP (User Messaging Platform) — GDPR/IDFA consent. Form is configured
 *      in AdMob Console > Privacy & messaging. Outside regulated regions it
 *      is a no-op. **The message must be published in AdMob Console** or
 *      `requestInfoUpdate` will always return `NOT_REQUIRED`.
 *   2. (iOS) App Tracking Transparency — must run AFTER UMP so the system
 *      dialog appears with the right context.
 *   3. mobileAds().initialize() — must be last; it freezes the request
 *      configuration that personalized ads depend on.
 *
 * Missing/out-of-order steps cause EU eCPM to drop drastically because the
 * first ad request ships without consent flags.
 *
 * Idempotent — multiple invocations return the same Promise.
 *
 * @see CLAUDE.md "광고 동의 시퀀스 (MANDATORY)" for the harness rule.
 */
export interface IAdConsentResult {
  umpStatus: AdsConsentStatus;
  /** AdMob SDK가 광고 요청을 보내도 되는지 여부. UMP 응답에서 파생. */
  canRequestAds: boolean;
  attStatus: 'granted' | 'denied' | 'undetermined' | 'restricted' | 'unavailable';
}

let consentPromise: Promise<IAdConsentResult> | null = null;
let isReady = false;
const readyListeners: (() => void)[] = [];

/** UMP/ATT 네트워크 지연 시 콜드 스타트가 무기한 차단되지 않도록 하는 상한 */
const CONSENT_STEP_TIMEOUT_MS = 8000;

/**
 * Promise에 타임아웃 가드를 씌운다. 제한 시간 초과 시 `fallback`으로 resolve해
 * 시퀀스가 멈추지 않도록 한다 (reject 아님 — 후속 단계를 계속 진행).
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      if (__DEV__) {
        console.warn(`[ads] consent step timed out after ${ms}ms — continuing`);
      }
      resolve(fallback);
    }, ms);
    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

/** SDK 초기화 완료 여부 — 광고 컴포넌트 마운트 가드용 */
export function isAdsReady(): boolean {
  return isReady;
}

/** SDK 초기화 완료 시 호출되는 콜백. 이미 ready면 즉시 실행. unsubscribe 반환. */
export function onAdsReady(listener: () => void): () => void {
  if (isReady) {
    listener();
    return (): void => undefined;
  }
  readyListeners.push(listener);
  return (): void => {
    const idx = readyListeners.indexOf(listener);
    if (idx >= 0) readyListeners.splice(idx, 1);
  };
}

/** UMP 상태 → user property 값 (kpis.md: obtained/required/not_required/unknown/error) */
function toUmpStatusProperty(status: AdsConsentStatus): string {
  switch (status) {
    case AdsConsentStatus.OBTAINED:
      return 'obtained';
    case AdsConsentStatus.REQUIRED:
      return 'required';
    case AdsConsentStatus.NOT_REQUIRED:
      return 'not_required';
    default:
      return 'unknown';
  }
}

function markReady(): void {
  isReady = true;
  while (readyListeners.length > 0) {
    const fn = readyListeners.shift();
    try {
      fn?.();
    } catch {
      // 한 listener 에러로 init 실패 막기
    }
  }
}

/**
 * 표준 광고 초기화. `_layout.tsx` (또는 root provider) 에서 1회 await.
 *
 * Expo Go에서는 native 모듈 부재로 no-op (ready=true 처리해 placeholder 광고만 렌더).
 * 모든 단계가 try/catch 로 보호되어 production crash 방지.
 */
export async function initializeAdsWithConsent(): Promise<IAdConsentResult> {
  // Expo Go 등 native 모듈 부재 환경: no-op but ready=true 처리
  if (env.IS_EXPO_GO) {
    markReady();
    return {
      umpStatus: AdsConsentStatus.UNKNOWN,
      canRequestAds: false,
      attStatus: 'unavailable',
    };
  }

  if (consentPromise) return consentPromise;

  consentPromise = (async (): Promise<IAdConsentResult> => {
    let umpStatus: AdsConsentStatus = AdsConsentStatus.UNKNOWN;
    let canRequestAds = false;
    let attStatus: IAdConsentResult['attStatus'] = 'unavailable';
    let umpFailed = false;

    // ── 1) UMP (GDPR) consent ────────────────────────────────────────────
    try {
      // requestInfoUpdate가 네트워크 지연 시 콜드 스타트를 무기한 막지 않도록 타임아웃 가드.
      const info = await withTimeout(
        AdsConsent.requestInfoUpdate(),
        CONSENT_STEP_TIMEOUT_MS,
        null,
      );
      if (info === null) {
        umpFailed = true;
      } else {
        umpStatus = info.status;
        canRequestAds = info.canRequestAds ?? false;
        if (info.isConsentFormAvailable && info.status === AdsConsentStatus.REQUIRED) {
          const formResult = await AdsConsent.loadAndShowConsentFormIfRequired();
          umpStatus = formResult.status;
          canRequestAds = formResult.canRequestAds ?? canRequestAds;
        }
      }
    } catch (error) {
      umpFailed = true;
      if (__DEV__) {
        console.warn('[ads] UMP consent flow failed:', error);
      }
    }

    // ── 2) (iOS) ATT prompt — UMP 폼 닫힌 직후 ──────────────────────────
    if (Platform.OS === 'ios') {
      // UMP modal → ATT alert 사이에 작은 gap 확보 + app state=active 보장
      await new Promise<void>((resolve) => setTimeout(resolve, 400));
      try {
        const current = await getTrackingPermissionsAsync();
        if (current.status === 'undetermined') {
          const requested = await requestTrackingPermissionsAsync();
          attStatus = requested.status;
        } else {
          attStatus = current.status;
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[ads] ATT permission flow failed:', error);
        }
      }
    }

    // ── 3) SDK 초기화 + request configuration ────────────────────────────
    try {
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
        // 무효 트래픽 격리 — 실광고 ID 빌드(preview/내부 배포)의 개발/테스터 기기 등록.
        // 에뮬레이터/시뮬레이터는 SDK가 자동 처리 (shared/config/ads.ts TEST_DEVICE_IDS).
        testDeviceIdentifiers: TEST_DEVICE_IDS,
      });
    } catch {
      // setRequestConfiguration 실패해도 초기화는 진행
    }

    try {
      await mobileAds().initialize();
    } catch (err) {
      if (__DEV__) {
        console.warn('[ads] mobileAds().initialize() failed:', err);
      }
    }

    // ── 4) 동의 상태 user property 기록 — 동의 상태별 eCPM/노출률 코호트 분리
    setAdsConsentProperties({
      umpStatus: umpFailed ? 'error' : toUmpStatusProperty(umpStatus),
      umpCanRequestAds: canRequestAds,
      attStatus: attStatus === 'unavailable' ? 'not_applicable' : attStatus,
    });

    markReady();
    return { umpStatus, canRequestAds, attStatus };
  })();

  return consentPromise;
}

/**
 * 사용자가 추후 동의를 변경하도록 "설정 > 광고 개인정보 설정" 같은 곳에서 호출.
 * `privacyOptionsRequirementStatus: REQUIRED` 인 경우에만 의미 있음.
 */
export async function showAdsConsentForm(): Promise<void> {
  if (env.IS_EXPO_GO) return;
  try {
    await AdsConsent.showForm();
  } catch (err) {
    if (__DEV__) {
      console.warn('[ads] showForm failed:', err);
    }
  }
}
