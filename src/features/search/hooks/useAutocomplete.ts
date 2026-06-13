// 단지명+법정동 통합 자동완성 (F-001) — 전부 로컬 번들 인덱스 기반.
// 네트워크 불필요 (비행기 모드 동작), 2글자 이상부터 매칭, useDeferredValue로
// 타이핑 응답성 확보 (성능 예산 300ms 이내 — 번들 수천 건 선형 스캔으로 충분).
import { useDeferredValue, useMemo } from 'react';
import { searchRegions, formatRegionName, getRegionName } from '@/entities/region';
import { getBundledApartments, matchesAptName } from '@/entities/apartment';
import type { TSearchResult, IApartmentSearchItem, IRegionSearchItem } from '../types';

export const MIN_QUERY_LENGTH = 2;
const MAX_APARTMENT_RESULTS = 10;
const MAX_REGION_RESULTS = 5;

export interface IUseAutocompleteResult {
  /** 단지 우선 + 지역 후순위 통합 결과 (0건이면 빈 상태 + 지역 검색 유도는 UI 책임) */
  results: TSearchResult[];
  /** 검색 가능 길이(2글자) 충족 여부 — 미충족 시 최근 검색 노출 (UI 분기용) */
  isActive: boolean;
}

const searchApartments = (query: string): IApartmentSearchItem[] =>
  getBundledApartments()
    .filter((apartment) => matchesAptName(apartment.aptNm, query))
    .slice(0, MAX_APARTMENT_RESULTS)
    .map((apartment) => ({
      type: 'apartment' as const,
      aptKey: apartment.aptKey,
      aptNm: apartment.aptNm,
      lawdCd: apartment.lawdCd,
      regionName: getRegionName(apartment.lawdCd) ?? '',
    }));

const searchRegionItems = (query: string): IRegionSearchItem[] =>
  searchRegions(query, MAX_REGION_RESULTS).map((region) => ({
    type: 'region' as const,
    lawdCd: region.lawdCd,
    regionName: formatRegionName(region),
  }));

export const useAutocomplete = (query: string): IUseAutocompleteResult => {
  const deferredQuery = useDeferredValue(query.trim());

  return useMemo(() => {
    if (deferredQuery.length < MIN_QUERY_LENGTH) {
      return { results: [], isActive: false };
    }
    return {
      results: [...searchApartments(deferredQuery), ...searchRegionItems(deferredQuery)],
      isActive: true,
    };
  }, [deferredQuery]);
};
