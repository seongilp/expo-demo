/** 법정동 시군구 코드 — 법정동코드 10자리 중 앞 5자리 */
export type TLawdCd = string;

/** 시군구 단위 지역 (국토부 실거래 API 조회 단위) */
export interface IRegion {
  lawdCd: TLawdCd;
  /** 시·도 명 (예: 서울특별시) */
  sido: string;
  /** 시·군·구 명 (예: 종로구, 수원시 장안구) */
  sigungu: string;
  /** 시군구 중심 좌표 — "내 주변" 역매핑용 (위도) */
  lat: number;
  /** 시군구 중심 좌표 — "내 주변" 역매핑용 (경도) */
  lng: number;
}
