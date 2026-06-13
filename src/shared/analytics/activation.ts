// Activation 이벤트 (활성 축 KPI) — 생애 최초 단지 상세 실거래 로드 완료 시 1회 발화.
// first_open 시각/발화 여부 플래그는 AsyncStorage 로컬 persist (비민감 데이터).
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { EVENTS, type TActivationFeatureId } from './events';
import { logEvent } from './client';

const FIRST_OPEN_AT_KEY = 'analytics.first-open-at';
const ACTIVATION_LOGGED_KEY = 'analytics.activation-logged';

/**
 * 최초 실행 시각 기록 — 루트 `_layout.tsx`에서 initAnalytics 직후 호출.
 * 이미 기록돼 있으면 no-op. activation.elapsed_sec 계산의 기준점이 된다.
 */
export const recordFirstOpenAt = async (): Promise<void> => {
  try {
    const existing = await AsyncStorage.getItem(FIRST_OPEN_AT_KEY);
    if (existing) return;
    await AsyncStorage.setItem(FIRST_OPEN_AT_KEY, new Date().toISOString());
  } catch (error) {
    if (__DEV__) {
      console.warn('[analytics] recordFirstOpenAt failed:', error);
    }
  }
};

/**
 * activation 이벤트 생애 1회 발화 — 단지 상세 실거래 로드 완료 콜백에서 호출.
 * 플래그를 먼저 기록해 이중 발화(빠른 재진입)를 차단한다.
 */
export const logActivationOnce = async (featureId: TActivationFeatureId): Promise<void> => {
  try {
    const alreadyLogged = await AsyncStorage.getItem(ACTIVATION_LOGGED_KEY);
    if (alreadyLogged === 'true') return;
    await AsyncStorage.setItem(ACTIVATION_LOGGED_KEY, 'true');

    const firstOpenAt = await AsyncStorage.getItem(FIRST_OPEN_AT_KEY);
    const elapsedSec = firstOpenAt
      ? Math.max(dayjs().diff(dayjs(firstOpenAt), 'second'), 0)
      : 0;

    logEvent(EVENTS.ACTIVATION, { feature_id: featureId, elapsed_sec: elapsedSec });
  } catch (error) {
    if (__DEV__) {
      console.warn('[analytics] logActivationOnce failed:', error);
    }
  }
};
