// User Property 카탈로그 + setter — kpis.md "User Properties" 표와 1:1.
// PII 금지: 모든 값은 비식별 코호트 분류용 문자열만 허용한다.
import { setUserProperty } from './client';

export const USER_PROPERTIES = {
  /** system / light / dark — 테마별 사용 패턴 코호트 */
  THEME_MODE: 'theme_mode',
  /** 0 / 1-3 / 4-10 / 11+ — 관심 단지 수와 리텐션 상관 */
  FAVORITE_BUCKET: 'favorite_bucket',
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
