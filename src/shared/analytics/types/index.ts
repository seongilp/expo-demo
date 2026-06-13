// 분석 모듈 기반 타입 — 어댑터 계약 + 파라미터 값 타입.
// 이벤트 이름/파라미터 맵은 `../events.ts`(카탈로그)가 단일 출처다.

/** Firebase GA4 파라미터로 허용하는 값 타입 (boolean은 어댑터에서 문자열 변환) */
export type TAnalyticsParamValue = string | number | boolean;

/** 이벤트 파라미터 입력 — undefined 값은 전송 전 제거된다 */
export type TAnalyticsParams = Record<string, TAnalyticsParamValue | undefined>;

/** 어댑터로 전달되는 정규화된 파라미터 (undefined 제거 + boolean 문자열화) */
export type TSanitizedParams = Record<string, string | number>;

/**
 * 분석 백엔드 어댑터 계약.
 * - firebase.ts: RNFB Analytics + Crashlytics (네이티브 빌드)
 * - noop.ts: Expo Go / Firebase 미설정 환경의 안전 no-op
 */
export interface IAnalyticsAdapter {
  /** Analytics + Crashlytics 수집 토글 (env.IS_PROD 기준) */
  setCollectionEnabled: (enabled: boolean) => Promise<void> | void;
  logEvent: (name: string, params?: TSanitizedParams) => void;
  logScreenView: (screenName: string) => void;
  setUserProperty: (key: string, value: string | null) => void;
  /** Crashlytics 비치명(non-fatal) 에러 리포트 */
  recordNonFatal: (error: Error) => void;
}
