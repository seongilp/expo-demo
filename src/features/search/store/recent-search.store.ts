// 최근 검색 store — Zustand persist (AsyncStorage, 비민감 데이터).
// 최대 10건, 중복 시 최상단 갱신, 개별/전체 삭제 (F-006).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IRecentSearch, TSearchResult } from '../types';

export const RECENT_SEARCH_LIMIT = 10;

/** 검색 결과의 중복 판정 키 */
export const getSearchResultKey = (result: TSearchResult): string =>
  result.type === 'apartment' ? `apartment:${result.aptKey}` : `region:${result.lawdCd}`;

interface IRecentSearchState {
  entries: IRecentSearch[];
  /** 검색 결과 기록 — 중복이면 최상단으로 끌어올림, 상한 초과분은 잘라냄 */
  addRecentSearch: (result: TSearchResult) => void;
  /** 개별 삭제 */
  removeRecentSearch: (result: TSearchResult) => void;
  /** 전체 삭제 */
  clearRecentSearches: () => void;
}

export const useRecentSearchStore = create<IRecentSearchState>()(
  persist(
    (set) => ({
      entries: [],

      addRecentSearch: (result) =>
        set((state) => {
          const key = getSearchResultKey(result);
          const withoutDuplicate = state.entries.filter(
            (entry) => getSearchResultKey(entry.result) !== key,
          );
          const next: IRecentSearch = {
            result,
            searchedAt: new Date().toISOString(),
          };
          return { entries: [next, ...withoutDuplicate].slice(0, RECENT_SEARCH_LIMIT) };
        }),

      removeRecentSearch: (result) =>
        set((state) => {
          const key = getSearchResultKey(result);
          return {
            entries: state.entries.filter((entry) => getSearchResultKey(entry.result) !== key),
          };
        }),

      clearRecentSearches: () => set({ entries: [] }),
    }),
    {
      name: 'recent-search-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
