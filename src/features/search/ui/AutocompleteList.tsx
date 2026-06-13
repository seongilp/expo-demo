// 통합 자동완성 결과 (F-001) — 단지(빌딩)/지역(핀) 행 56px, 매칭 구간 하이라이트.
// 0건이면 빈 상태 + 지역 검색 유도. 키보드 유지(keyboardShouldPersistTaps).
import { View, Pressable } from 'react-native';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { AppText, EmptyState } from '@/shared/ui';
import { useThemeTokens } from '@/shared/lib';
import type { TSearchResult } from '../types';

interface IAutocompleteListProps {
  results: TSearchResult[];
  /** 하이라이트 대상 검색어 */
  query: string;
  onSelect: (result: TSearchResult) => void;
}

const resultKey = (result: TSearchResult): string =>
  result.type === 'apartment' ? `apartment:${result.aptKey}` : `region:${result.lawdCd}`;

/** 매칭 구간만 강조 — 본문 분할 렌더 (대소문자/공백 정규화 없이 단순 포함 매칭) */
function HighlightedText({ text, query }: { text: string; query: string }): React.JSX.Element {
  const matchIndex = query.length > 0 ? text.indexOf(query) : -1;
  if (matchIndex < 0) {
    return <AppText variant="body">{text}</AppText>;
  }
  return (
    <AppText variant="body">
      {text.slice(0, matchIndex)}
      <AppText variant="body" tone="primary" className="font-semibold">
        {text.slice(matchIndex, matchIndex + query.length)}
      </AppText>
      {text.slice(matchIndex + query.length)}
    </AppText>
  );
}

export function AutocompleteList({
  results,
  query,
  onSelect,
}: IAutocompleteListProps): React.JSX.Element {
  const { tokens } = useThemeTokens();

  const renderItem = ({ item }: ListRenderItemInfo<TSearchResult>): React.JSX.Element => {
    const isApartment = item.type === 'apartment';
    const title = isApartment ? item.aptNm : item.regionName;
    const subtitle = isApartment ? item.regionName : '지역 전체 보기';

    return (
      <Pressable
        onPress={() => onSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`${title} ${isApartment ? '단지' : '지역'} 검색 결과`}
        className="h-14 flex-row items-center active:opacity-85"
      >
        <Ionicons
          name={isApartment ? 'business-outline' : 'location-outline'}
          size={20}
          color={tokens.textTertiary}
        />
        <View className="ml-3 flex-1">
          <HighlightedText text={title} query={query.trim()} />
          <AppText variant="caption" tone="sub" numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
      </Pressable>
    );
  };

  return (
    <FlashList
      data={results}
      renderItem={renderItem}
      keyExtractor={resultKey}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <EmptyState
          icon="search-outline"
          title="검색 결과가 없어요"
          description="단지명 또는 시군구로 다시 검색해 보세요"
          compact
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}
