import type { TLawdCd } from '@/entities/region';
import type { TAptKey } from '@/entities/apartment';

export type TSearchResultType = 'apartment' | 'region';

/** 자동완성 — 단지 항목 */
export interface IApartmentSearchItem {
  type: 'apartment';
  aptKey: TAptKey;
  aptNm: string;
  lawdCd: TLawdCd;
  /** 소속 시군구 병기 표기 (예: "서울특별시 강남구") */
  regionName: string;
}

/** 자동완성 — 지역 항목 */
export interface IRegionSearchItem {
  type: 'region';
  lawdCd: TLawdCd;
  regionName: string;
}

/** 통합 자동완성 결과 (단지 + 지역 유니온) */
export type TSearchResult = IApartmentSearchItem | IRegionSearchItem;

/** 최근 검색 항목 — persist 저장 단위 */
export interface IRecentSearch {
  result: TSearchResult;
  /** ISO 타임스탬프 (정렬용) */
  searchedAt: string;
}

/** 지역 단지 리스트 행 — 최근 3개월 실거래 + 로컬 번들 하이브리드 (F-008, [4b] 훅 계약) */
export interface IRegionAptListItem {
  aptKey: TAptKey;
  aptNm: string;
  lawdCd: TLawdCd;
  /** 준공년도 — 번들에 없으면 null */
  builtYear: number | null;
  /** 최근 거래금액(만원) — 최근 3개월 거래 없으면 null */
  latestDealAmount: number | null;
  /** 최근 계약일 (YYYY-MM-DD) — 없으면 null */
  latestDealDate: string | null;
  /** 최근 3개월 거래 건수 (해제 제외) */
  tradeCount: number;
}
