// shared/analytics 공개 API — 외부 코드는 이 barrel만 import 한다.
// firebase.ts(어댑터 내부)는 공개하지 않는다 — 직접 호출 금지 (Hard Threshold).
export { initAnalytics, logEvent, logScreenView, setUserProperty, recordNonFatal } from './client';
export { EVENTS } from './events';
export type {
  TEventName,
  IEventParamsMap,
  TApartmentEntryPoint,
  TActivationFeatureId,
  TNearbyPermissionResult,
  TTradeFetchFailReason,
  TRecentSearchEntryType,
  TThemeModeParam,
} from './events';
export {
  USER_PROPERTIES,
  setThemeModeProperty,
  setFavoriteBucketProperty,
  setAdsConsentProperties,
  toFavoriteBucket,
} from './user-properties';
export type { TUserPropertyKey, TThemeModeProperty, IAdsConsentProperties } from './user-properties';
export { recordFirstOpenAt, logActivationOnce } from './activation';
export { useScreenTracking } from './hooks';
export type { TAnalyticsParams, TAnalyticsParamValue, IAnalyticsAdapter } from './types';
