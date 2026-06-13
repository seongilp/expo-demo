// 평형별 가격 비교 (F-004) — 가로 막대 + 범례 행 (chartCategorical 시리즈 색).
// 구간 탭 시 onSelect로 실거래 리스트 필터 연동, 재탭 시 해제.
// 1개 구간뿐이면 막대 없이 단일 요약 표기 (빈 비교 차트 금지).
import { View, Pressable } from 'react-native';
import { AppText } from '@/shared/ui';
import { useThemeTokens, formatDealAmount, formatSquareMeters } from '@/shared/lib';
import { EVENTS, logEvent } from '@/shared/analytics';
import type { IAreaGroupStat } from '@/entities/transaction';
import type { TSelectedAreaGroup } from '../types';

interface IAreaCompareChartProps {
  /** 평수 오름차순 구간 통계 */
  groups: IAreaGroupStat[];
  selected: TSelectedAreaGroup;
  onSelect: (group: TSelectedAreaGroup) => void;
}

const MIN_BAR_RATIO = 0.08;

const formatAreaRange = (group: IAreaGroupStat): string =>
  Math.round(group.minArea) === Math.round(group.maxArea)
    ? formatSquareMeters(group.minArea)
    : `${formatSquareMeters(group.minArea)}~${formatSquareMeters(group.maxArea)}`;

function SingleGroupSummary({ group }: { group: IAreaGroupStat }): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-between py-1">
      <View>
        <AppText variant="bodyStrong">{group.label}</AppText>
        <AppText variant="caption">
          {formatAreaRange(group)} · {group.count}건
        </AppText>
      </View>
      <View className="items-end">
        <AppText variant="priceMd">{formatDealAmount(group.averageAmount)}</AppText>
        <AppText variant="caption" tone="faint">
          최근 {formatDealAmount(group.latestAmount)}
        </AppText>
      </View>
    </View>
  );
}

export function AreaCompareChart({
  groups,
  selected,
  onSelect,
}: IAreaCompareChartProps): React.JSX.Element | null {
  const { tokens } = useThemeTokens();

  if (groups.length === 0) return null;
  if (groups.length === 1) return <SingleGroupSummary group={groups[0]} />;

  const maxAverage = Math.max(...groups.map((group) => group.averageAmount));

  return (
    <View accessibilityLabel="평형별 가격 비교 차트">
      {groups.map((group, index) => {
        const color = tokens.chartCategorical[index % tokens.chartCategorical.length];
        const ratio =
          maxAverage > 0
            ? Math.max(group.averageAmount / maxAverage, MIN_BAR_RATIO)
            : MIN_BAR_RATIO;
        const isSelected = selected === group.pyeong;

        return (
          <Pressable
            key={group.pyeong}
            onPress={() => {
              if (!isSelected) {
                // 선택 시에만 수집 (해제는 미수집) — area_group = 대표 평수 (F-004)
                logEvent(EVENTS.SELECT_AREA_GROUP, { area_group: group.pyeong });
              }
              onSelect(isSelected ? null : group.pyeong);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${group.label} 평균 ${formatDealAmount(group.averageAmount)}, ${group.count}건${isSelected ? ', 선택됨' : ''}`}
            accessibilityState={{ selected: isSelected }}
            className={`rounded-lg px-2 py-2 ${
              isSelected ? 'bg-primary-50 dark:bg-primary-900' : 'active:opacity-85'
            }`}
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: color }}
                className="mr-2 h-2 w-2 rounded-full"
              />
              <AppText variant="caption" tone="default" className="font-medium">
                {group.label}
              </AppText>
              <AppText variant="caption" tone="faint" className="ml-1.5">
                {formatAreaRange(group)} · {group.count}건
              </AppText>
              <View className="flex-1" />
              <AppText variant="priceMd">{formatDealAmount(group.averageAmount)}</AppText>
            </View>
            <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-raised dark:bg-raised-dark">
              <View
                style={{ width: `${Math.round(ratio * 100)}%`, backgroundColor: color }}
                className="h-full rounded-full"
              />
            </View>
          </Pressable>
        );
      })}
      <AppText variant="micro" tone="faint" className="mt-2">
        평형을 누르면 아래 실거래 내역이 해당 평형으로 좁혀져요
      </AppText>
    </View>
  );
}
