// Firebase Analytics/Crashlytics 래퍼 — 외부 코드의 유일한 진입점.
// - 직접 `firebase.analytics()`/`getAnalytics()` 호출 금지 (Hard Threshold)
// - 이벤트 이름은 events.ts의 EVENTS 상수만 (매직 스트링 0)
// - Expo Go/Firebase 미설정 시 noop fallback — typecheck/번들/런타임 안전
// - dev 빌드는 수집 비활성(IS_PROD 토글) + __DEV__ 콘솔 디버그 출력
import Constants from 'expo-constants';
import { env } from '@/shared/config';
import type { TEventName, IEventParamsMap } from './events';
import type { IAnalyticsAdapter, TAnalyticsParams, TSanitizedParams } from './types';
import { noopAdapter } from './noop';

/** GA4 제약 — 이벤트 이름 ≤ 40자, [a-z0-9_], 소문자 시작 */
const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]{0,39}$/;
/** GA4 제약 — 파라미터 값 길이 ≤ 100자 */
const MAX_PARAM_VALUE_LENGTH = 100;

function resolveAdapter(): IAnalyticsAdapter {
  // Expo Go는 네이티브 Firebase 모듈을 번들하지 않는다 — noop으로 크래시 방지
  if (Constants.appOwnership === 'expo') return noopAdapter;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./firebase') as { firebaseAdapter: IAnalyticsAdapter };
    return mod.firebaseAdapter;
  } catch (error) {
    // 네이티브 모듈 부재 또는 GoogleService 파일 미배치(콘솔 등록 전) — 안전 no-op
    if (__DEV__) {
      console.warn('[analytics] Firebase unavailable — falling back to noop:', error);
    }
    return noopAdapter;
  }
}

const adapter: IAnalyticsAdapter = resolveAdapter();

/** undefined 제거 + boolean 문자열화 + 값 길이 상한 적용 */
function sanitizeParams(params?: TAnalyticsParams): TSanitizedParams | undefined {
  if (!params) return undefined;
  const sanitized: TSanitizedParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (typeof value === 'boolean') {
      sanitized[key] = String(value);
    } else if (typeof value === 'string') {
      sanitized[key] = value.slice(0, MAX_PARAM_VALUE_LENGTH);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Analytics/Crashlytics 초기화 — 루트 `_layout.tsx`에서 1회 호출.
 * dev 환경은 수집 비활성화(IS_PROD 토글)로 KPI 오염을 방지한다.
 */
export async function initAnalytics(): Promise<void> {
  try {
    await adapter.setCollectionEnabled(env.IS_PROD);
    adapter.setUserProperty('app_version', env.APP_VERSION);
    if (__DEV__) {
      console.log('[analytics] initialized (collection:', env.IS_PROD, ')');
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[analytics] init failed:', error);
    }
  }
}

/**
 * 타입 안전 이벤트 로깅 — `EVENTS.*` 상수와 카탈로그 파라미터 타입만 허용.
 * 파라미터 없는 이벤트(clear_query_cache)는 두 번째 인자를 생략한다.
 */
export function logEvent<K extends TEventName>(
  name: K,
  ...rest: undefined extends IEventParamsMap[K]
    ? [params?: IEventParamsMap[K]]
    : [params: IEventParamsMap[K]]
): void {
  const [params] = rest;
  if (!EVENT_NAME_PATTERN.test(name)) {
    if (__DEV__) {
      console.warn('[analytics] invalid event name:', name);
    }
    return;
  }
  try {
    const sanitized = sanitizeParams(params as TAnalyticsParams | undefined);
    if (__DEV__) {
      console.log('[analytics:event]', name, sanitized ?? {});
    }
    adapter.logEvent(name, sanitized);
  } catch (error) {
    if (__DEV__) {
      console.warn('[analytics] logEvent failed:', name, error);
    }
  }
}

/** screen_view 자동 수집 — useScreenTracking 훅 경유 사용 권장 */
export function logScreenView(screenName: string): void {
  try {
    if (__DEV__) {
      console.log('[analytics:screen]', screenName);
    }
    adapter.logScreenView(screenName);
  } catch (error) {
    if (__DEV__) {
      console.warn('[analytics] logScreenView failed:', screenName, error);
    }
  }
}

/** user property 설정 — 카탈로그 키는 user-properties.ts setter 경유 사용 권장 */
export function setUserProperty(key: string, value: string | null): void {
  try {
    adapter.setUserProperty(key, value);
  } catch (error) {
    if (__DEV__) {
      console.warn('[analytics] setUserProperty failed:', key, error);
    }
  }
}

/**
 * Crashlytics 비치명(non-fatal) 리포트 — XML 파싱 실패(R-4) 등
 * 크래시는 아니지만 데이터 신뢰도에 영향을 주는 예외를 기록한다.
 * 에러 메시지에 토큰/serviceKey/PII가 포함되지 않도록 호출자가 보장한다.
 */
export function recordNonFatal(error: unknown): void {
  try {
    const normalized = error instanceof Error ? error : new Error(String(error));
    if (__DEV__) {
      console.warn('[analytics:non-fatal]', normalized.message);
    }
    adapter.recordNonFatal(normalized);
  } catch (reportError) {
    if (__DEV__) {
      console.warn('[analytics] recordNonFatal failed:', reportError);
    }
  }
}
