/** 위치 좌표 — 시군구 변환 즉시 폐기. 저장/전송/Analytics 로깅 절대 금지 (F-007 정책). */
export interface ICoords {
  latitude: number;
  longitude: number;
}

/** 위치 권한 결과 */
export type TLocationPermissionResult = 'granted' | 'denied' | 'blocked';

/** 내 주변 시세 해석 결과 ([4b] useNearbyRegion 계약) — 좌표는 포함하지 않는다 */
export interface INearbyResolveResult {
  permission: TLocationPermissionResult;
  /** granted + 서비스 지역 내일 때만 시군구 코드. 그 외 null */
  lawdCd: string | null;
  /** 시군구 표기 (예: "서울특별시 강남구") — lawdCd와 동시 존재 */
  regionName: string | null;
}
