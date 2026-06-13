// 최근 검색 목록 (F-006) — 원탭 재조회 + 개별 X(44px) / 전체 삭제.
// 최대 10건 고정이라 가상화 불필요 — 일반 View 렌더 (스크린 ScrollView/뷰에 합성).
// 0건이면 섹션 자체를 렌더하지 않는다 (빈 섹션 헤더 금지).
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Badge } from '@/shared/ui';
import { useThemeTokens } from '@/shared/lib';
import { useRecentSearchStore, getSearchResultKey } from '../store';
import type { TSearchResult } from '../types';

const REMOVE_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 } as const;

interface IRecentSearchListProps {
  onSelect: (result: TSearchResult) => void;
}

export function RecentSearchList({ onSelect }: IRecentSearchListProps): React.JSX.Element | null {
  const { tokens } = useThemeTokens();
  const entries = useRecentSearchStore((state) => state.entries);
  const removeRecentSearch = useRecentSearchStore((state) => state.removeRecentSearch);
  const clearRecentSearches = useRecentSearchStore((state) => state.clearRecentSearches);

  if (entries.length === 0) return null;

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <AppText variant="h2">최근 검색</AppText>
        <Pressable
          onPress={clearRecentSearches}
          accessibilityRole="button"
          accessibilityLabel="최근 검색 전체 삭제"
          className="h-11 justify-center px-2 active:opacity-70"
        >
          <AppText variant="caption" tone="primary">
            전체 삭제
          </AppText>
        </Pressable>
      </View>
      {entries.map((entry) => {
        const { result } = entry;
        const isApartment = result.type === 'apartment';
        const title = isApartment ? result.aptNm : result.regionName;

        return (
          <View key={getSearchResultKey(result)} className="h-13 flex-row items-center">
            <Pressable
              onPress={() => onSelect(result)}
              accessibilityRole="button"
              accessibilityLabel={`최근 검색 ${title} 다시 조회`}
              className="h-full flex-1 flex-row items-center active:opacity-85"
            >
              <Ionicons name="time-outline" size={18} color={tokens.textTertiary} />
              <AppText variant="body" className="ml-3 flex-1" numberOfLines={1}>
                {title}
              </AppText>
              <Badge label={isApartment ? '단지' : '지역'} variant="neutral" className="mr-2" />
            </Pressable>
            <Pressable
              onPress={() => removeRecentSearch(result)}
              hitSlop={REMOVE_HIT_SLOP}
              accessibilityRole="button"
              accessibilityLabel={`최근 검색 ${title} 삭제`}
              className="h-11 w-8 items-center justify-center"
            >
              <Ionicons name="close" size={16} color={tokens.textTertiary} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
