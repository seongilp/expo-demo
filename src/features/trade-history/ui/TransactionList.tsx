// 실거래 리스트 (F-002) — FlashList v2 (estimatedItemSize 미지정).
// 월 섹션을 평탄화(월 헤더 행 + 거래 행)해 단일 리스트로 렌더 — 단지 상세에서는
// ListHeaderComponent 슬롯으로 요약/차트 블록을 받아 중첩 스크롤을 피한다.
import { useMemo, ReactElement } from 'react';
import { View, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { AppText, EmptyState } from '@/shared/ui';
import { useThemeTokens } from '@/shared/lib';
import type { ITransaction } from '@/entities/transaction';
import type { ITradeMonthSection } from '../types';
import { TransactionItem } from './TransactionItem';

type TListRow =
  | { type: 'month-header'; key: string; title: string }
  | { type: 'transaction'; key: string; transaction: ITransaction };

interface ITransactionListProps {
  sections: ITradeMonthSection[];
  /** 추가 로드 가능 여부 (최대 24개월) */
  hasMore: boolean;
  /** 과거 월 추가 로드 중 — 푸터 인라인 스피너 */
  isLoadingMore: boolean;
  onLoadMore: () => void;
  /** 단지 상세 상단 블록 (위젯/섹션 타이틀) 슬롯 */
  ListHeaderComponent?: ReactElement;
  /** 거래 0건 빈 상태 (기본 문구 오버라이드 가능) */
  ListEmptyComponent?: ReactElement;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const flattenSections = (sections: ITradeMonthSection[]): TListRow[] =>
  sections.flatMap<TListRow>((section) => [
    { type: 'month-header', key: `month:${section.monthKey}`, title: section.title },
    ...section.transactions.map<TListRow>((transaction) => ({
      type: 'transaction',
      key: `tx:${transaction.id}`,
      transaction,
    })),
  ]);

function MonthHeaderRow({ title }: { title: string }): React.JSX.Element {
  return (
    <View className="bg-background px-5 py-2 dark:bg-background-dark">
      <AppText variant="caption" tone="sub" className="font-semibold">
        {title}
      </AppText>
    </View>
  );
}

function ListFooter({ isLoadingMore }: { isLoadingMore: boolean }): React.JSX.Element | null {
  const { tokens } = useThemeTokens();
  if (!isLoadingMore) return null;
  return (
    <View className="items-center py-4">
      <ActivityIndicator size="small" color={tokens.primary} />
    </View>
  );
}

const renderRow = ({ item }: ListRenderItemInfo<TListRow>): React.JSX.Element =>
  item.type === 'month-header' ? (
    <MonthHeaderRow title={item.title} />
  ) : (
    <TransactionItem transaction={item.transaction} />
  );

export function TransactionList({
  sections,
  hasMore,
  isLoadingMore,
  onLoadMore,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
}: ITransactionListProps): React.JSX.Element {
  const rows = useMemo(() => flattenSections(sections), [sections]);

  const handleEndReached = (): void => {
    if (hasMore && !isLoadingMore) onLoadMore();
  };

  return (
    <FlashList
      data={rows}
      renderItem={renderRow}
      keyExtractor={(item) => item.key}
      getItemType={(item) => item.type}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        ListEmptyComponent ?? (
          <EmptyState
            icon="receipt-outline"
            title="최근 거래 내역이 없어요"
            description="최근 거래가 쌓이면 이곳에 표시돼요"
          />
        )
      }
      ListFooterComponent={<ListFooter isLoadingMore={isLoadingMore} />}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
    />
  );
}
