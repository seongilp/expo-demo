// 안전 no-op 어댑터 — Expo Go / Firebase 네이티브 모듈 부재·미설정 환경.
// 디버그 콘솔 출력은 client.ts가 일원화해 담당한다 (이중 로그 방지).
import type { IAnalyticsAdapter } from './types';

export const noopAdapter: IAnalyticsAdapter = {
  setCollectionEnabled: () => undefined,
  logEvent: () => undefined,
  logScreenView: () => undefined,
  setUserProperty: () => undefined,
  recordNonFatal: () => undefined,
};
