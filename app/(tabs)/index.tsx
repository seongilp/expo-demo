// 홈 — 관심 단지 카드 목록 + 최근 검색 (F-005/F-006, screen-layouts.md §1).
// 광고 배치 금지 화면. 0개면 검색 유도 EmptyState + 최근 검색 칩 노출.
import { useCallback } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, FakeSearchBar, EmptyState } from '@/shared/ui';
import { useThemeTokens } from '@/shared/lib';
import { EVENTS, logEvent, useScreenTracking } from '@/shared/analytics';
import {
  useFavoritesStore,
  useFavoriteSummaries,
  FAVORITES_LIMIT,
  IFavoriteApartment,
} from '@/features/favorites';
import {
  useRecentSearchStore,
  getSearchResultKey,
  TSearchResult,
} from '@/features/search';
import { FavoriteAptCard } from '@widgets/favorite-apt-card';

const CHIP_REMOVE_HIT_SLOP = { top: 10, bottom: 10, left: 6, right: 6 } as const;

/** 최근 검색 칩 (가로 스크롤) — 탭 시 원탭 재조회 */
function RecentSearchChips({
  onSelect,
}: {
  onSelect: (result: TSearchResult) => void;
}): React.JSX.Element | null {
  const { tokens } = useThemeTokens();
  const entries = useRecentSearchStore((state) => state.entries);
  const removeRecentSearch = useRecentSearchStore((state) => state.removeRecentSearch);

  if (entries.length === 0) return null;

  return (
    <View className="mt-6">
      <AppText variant="h2">최근 검색</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
        keyboardShouldPersistTaps="handled"
      >
        {entries.map((entry) => {
          const { result } = entry;
          const title = result.type === 'apartment' ? result.aptNm : result.regionName;
          return (
            <View
              key={getSearchResultKey(result)}
              className="mr-2 h-9 flex-row items-center rounded-full bg-raised pl-3.5 pr-2 dark:bg-raised-dark"
            >
              <Pressable
                onPress={() => onSelect(result)}
                accessibilityRole="button"
                accessibilityLabel={`최근 검색 ${title} 다시 조회`}
                className="h-full justify-center active:opacity-70"
              >
                <AppText variant="caption" tone="default">
                  {title}
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => removeRecentSearch(result)}
                hitSlop={CHIP_REMOVE_HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel={`최근 검색 ${title} 삭제`}
                className="ml-1 h-full justify-center"
              >
                <Ionicons name="close" size={14} color={tokens.textTertiary} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen(): React.JSX.Element {
  useScreenTracking('home');
  const router = useRouter();
  const favorites = useFavoritesStore((state) => state.favorites);
  const { summaries, isLoading } = useFavoriteSummaries();

  // 최근 검색 칩 탭 — tap_recent_search (F-006) + entry=recent
  const openSearchResult = useCallback(
    (result: TSearchResult): void => {
      logEvent(EVENTS.TAP_RECENT_SEARCH, { entry_type: result.type });
      if (result.type === 'apartment') {
        router.push({
          pathname: '/apartment/[aptKey]',
          params: { aptKey: result.aptKey, entry: 'recent' },
        });
      } else {
        router.push({ pathname: '/region/[lawdCd]', params: { lawdCd: result.lawdCd } });
      }
    },
    [router],
  );

  // 관심 단지 카드 탭 — tap_favorite_card (F-005) + entry=favorite
  const openFavorite = useCallback(
    (item: IFavoriteApartment): void => {
      logEvent(EVENTS.TAP_FAVORITE_CARD, { lawd_cd: item.lawdCd });
      router.push({
        pathname: '/apartment/[aptKey]',
        params: { aptKey: item.aptKey, entry: 'favorite' },
      });
    },
    [router],
  );

  const renderItem = ({ item }: ListRenderItemInfo<IFavoriteApartment>): React.JSX.Element => (
    <FavoriteAptCard
      favorite={item}
      summary={summaries[item.aptKey]}
      isLoading={isLoading}
      onPress={() => openFavorite(item)}
    />
  );

  const listHeader = (
    <View>
      <AppText variant="h1" className="mt-2">
        집값노트
      </AppText>
      <FakeSearchBar onPress={() => router.push('/search')} className="mt-4" />
      <View className="mt-6 flex-row items-center justify-between">
        <AppText variant="h2">관심 단지</AppText>
        <AppText variant="caption" tone="faint">
          {favorites.length}/{FAVORITES_LIMIT}
        </AppText>
      </View>
    </View>
  );

  const listEmpty = (
    <View>
      <EmptyState
        icon="star-outline"
        title="관심 단지를 모아보세요"
        description="★을 누르면 홈에서 최신 실거래를 바로 확인할 수 있어요"
        action={{ label: '단지 검색하기', onPress: () => router.push('/search') }}
      />
      <RecentSearchChips onSelect={openSearchResult} />
    </View>
  );

  return (
    <Screen>
      <FlashList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.aptKey}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          favorites.length > 0 ? <RecentSearchChips onSelect={openSearchResult} /> : null
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
