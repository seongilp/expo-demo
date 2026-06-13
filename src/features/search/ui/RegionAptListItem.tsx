// 지역 단지 행 (F-008, nativewind-theme.md §4.5 RegionAptListItem) — 높이 72.
// 좌: 단지명 + 거래 건수/준공년도, 우: 최근 거래가(tabular) + 계약일 + chevron.
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/ui';
import { useThemeTokens, formatDealAmount, formatDealDateShort } from '@/shared/lib';
import type { IRegionAptListItem } from '../types';

interface IRegionAptListItemProps {
  item: IRegionAptListItem;
  onPress: (item: IRegionAptListItem) => void;
}

const buildSubtitle = (item: IRegionAptListItem): string => {
  const parts: string[] = [];
  if (item.tradeCount > 0) parts.push(`최근 거래 ${item.tradeCount}건`);
  if (item.builtYear !== null) parts.push(`${item.builtYear}년식`);
  return parts.length > 0 ? parts.join(' · ') : '최근 3개월 거래 없음';
};

export function RegionAptListItem({ item, onPress }: IRegionAptListItemProps): React.JSX.Element {
  const { tokens } = useThemeTokens();

  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.aptNm} 단지 상세 보기`}
      className="h-18 flex-row items-center border-b border-line px-5 active:opacity-85 dark:border-line-dark"
    >
      <View className="flex-1 pr-3">
        <AppText variant="h3" numberOfLines={1}>
          {item.aptNm}
        </AppText>
        <AppText variant="caption" className="mt-0.5">
          {buildSubtitle(item)}
        </AppText>
      </View>
      <View className="items-end">
        {item.latestDealAmount !== null ? (
          <>
            <AppText variant="priceMd">{formatDealAmount(item.latestDealAmount)}</AppText>
            {item.latestDealDate !== null ? (
              <AppText variant="caption" tone="faint" className="mt-0.5">
                {formatDealDateShort(item.latestDealDate)} 계약
              </AppText>
            ) : null}
          </>
        ) : (
          <AppText variant="caption" tone="faint">
            거래 없음
          </AppText>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={tokens.textTertiary}
        style={{ marginLeft: 8 }}
      />
    </Pressable>
  );
}
