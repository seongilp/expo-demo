// User Property 카탈로그 + setter — kpis.md "User Properties" 표와 1:1.
// PII 금지: 모든 값은 비식별 코호트 분류용 문자열만 허용한다.
import { setUserProperty } from './client';

export const USER_PROPERTIES = {
  /** system / light / dark — 테마별 사용 패턴 코호트 */
  THEME_MODE: 'theme_mode',
  /** 0 / 1-3 / 4-10 / 11+ — 관심 단지 수와 리텐션 상관 */
  FAVORITE_BUCKET: 'favorite_bucket',
  /** obtained / required / not_required / unknown / error — UMP 동의 상태 */
  UMP_STATUS: 'ump_status',
  /** 'true' / 'false' — 광고 요청 가능 여부 */
  UMP_CAN_REQUEST_ADS: 'ump_can_request_ads',
  /** granted / denied / undetermined / restricted / not_applicable — iOS ATT */
  ATT_STATUS: 'att_status',
} as const;

export type TUserPropertyKey = (typeof USER_PROPERTIES)[keyof typeof USER_PROPERTIES];

export type TThemeModeProperty = 'system' | 'light' | 'dark';

export const setThemeModeProperty = (mode: TThemeModeProperty): void => {
  setUserProperty(USER_PROPERTIES.THEME_MODE, mode);
};

/** 관심 단지 수 → 코호트 버킷 (kpis.md: 0 / 1-3 / 4-10 / 11+) */
export const toFavoriteBucket = (count: number): string => {
  if (count <= 0) return '0';
  if (count <= 3) return '1-3';
  if (count <= 10) return '4-10';
  return '11+';
};

export const setFavoriteBucketProperty = (count: number): void => {
  setUserProperty(USER_PROPERTIES.FAVORITE_BUCKET, toFavoriteBucket(count));
};

/** 광고 동의 상태 — features/ads consent 시퀀스 완료 후 1회 기록 (eCPM 코호트) */
export interface IAdsConsentProperties {
  umpStatus: string;
  umpCanRequestAds: boolean;
  attStatus: string;
}

export const setAdsConsentProperties = ({
  umpStatus,
  umpCanRequestAds,
  attStatus,
}: IAdsConsentProperties): void => {
  setUserProperty(USER_PROPERTIES.UMP_STATUS, umpStatus);
  setUserProperty(USER_PROPERTIES.UMP_CAN_REQUEST_ADS, String(umpCanRequestAds));
  setUserProperty(USER_PROPERTIES.ATT_STATUS, attStatus);
};
