// features/search — 통합 자동완성(단지+지역) / 최근 검색 (F-001, F-006, F-008)
export type {
  TSearchResultType,
  IApartmentSearchItem,
  IRegionSearchItem,
  TSearchResult,
  IRecentSearch,
  IRegionAptListItem,
} from './types';
export { useRecentSearchStore, getSearchResultKey, RECENT_SEARCH_LIMIT } from './store';
export { useAutocomplete, useRegionAptList, MIN_QUERY_LENGTH } from './hooks';
export type { IUseAutocompleteResult, IUseRegionAptListResult } from './hooks';
export { AutocompleteList, RecentSearchList, RegionAptListItem } from './ui';
