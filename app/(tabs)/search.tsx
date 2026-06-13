// 검색 — 통합 자동완성 + 최근 검색 + 내 주변 (F-001/F-006/F-007, screen-layouts.md §2).
// 광고 배치 금지 화면. 검색 데이터는 전부 로컬 번들 — 네트워크 로딩/에러 상태 없음.
import { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, SearchBar } from '@/shared/ui';
import {
  EVENTS,
  logEvent,
  useScreenTracking,
  type TApartmentEntryPoint,
} from '@/shared/analytics';
import {
  useAutocomplete,
  useRecentSearchStore,
  AutocompleteList,
  RecentSearchList,
  TSearchResult,
} from '@/features/search';
import { NearbyButton } from '@/features/nearby';

export default function SearchScreen(): React.JSX.Element {
  useScreenTracking('search');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { results, isActive } = useAutocomplete(query);
  const addRecentSearch = useRecentSearchStore((state) => state.addRecentSearch);

  const navigateToResult = useCallback(
    (result: TSearchResult, entry: TApartmentEntryPoint): void => {
      addRecentSearch(result);
      if (result.type === 'apartment') {
        // entry — 단지 상세 view_apartment_detail.entry_point / activation 귀속
        router.push({
          pathname: '/apartment/[aptKey]',
          params: { aptKey: result.aptKey, entry },
        });
      } else {
        router.push({ pathname: '/region/[lawdCd]', params: { lawdCd: result.lawdCd } });
      }
    },
    [addRecentSearch, router],
  );

  // 자동완성 선택 — search_apartment/search_region (F-001, Flow A 탭 2→3)
  const openFromAutocomplete = useCallback(
    (result: TSearchResult): void => {
      const queryLength = query.trim().length;
      if (result.type === 'apartment') {
        logEvent(EVENTS.SEARCH_APARTMENT, { lawd_cd: result.lawdCd, query_length: queryLength });
      } else {
        logEvent(EVENTS.SEARCH_REGION, { lawd_cd: result.lawdCd, query_length: queryLength });
      }
      navigateToResult(result, 'search');
    },
    [navigateToResult, query],
  );

  // 최근 검색 탭 — tap_recent_search (F-006)
  const openFromRecent = useCallback(
    (result: TSearchResult): void => {
      logEvent(EVENTS.TAP_RECENT_SEARCH, { entry_type: result.type });
      navigateToResult(result, 'recent');
    },
    [navigateToResult],
  );

  return (
    <Screen>
      <View className="flex-1 px-5">
        <SearchBar value={query} onChangeText={setQuery} autoFocus className="mt-3" />

        {isActive ? (
          // 입력 중 — 자동완성 (단지 행 탭 → 상세: Flow A 탭 2→3)
          <View className="mt-2 flex-1">
            <AutocompleteList results={results} query={query} onSelect={openFromAutocomplete} />
          </View>
        ) : (
          // 입력 없음 — 내 주변 + 최근 검색
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <View className="mt-3">
              <NearbyButton />
            </View>
            <View className="mt-6">
              <RecentSearchList onSelect={openFromRecent} />
            </View>
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}
