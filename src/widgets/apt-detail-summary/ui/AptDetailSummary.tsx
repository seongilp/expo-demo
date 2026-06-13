// 단지 상세 상단 블록 (F-002~F-005 조합, screen-layouts.md §5).
// Summary(최근 거래가 + 전월 대비) + 시세 추이 카드(PeriodToggle) + 평형 비교 카드 +
// 데이터 출처 고지 + 실거래 섹션 타이틀까지 — 상세 스크린 리스트의 헤더로 쓰인다.
// features 간 직접 참조 금지 규칙에 따라 price-chart/trade-history 조합은 widget이 담당.
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Card, AppText, SkeletonPrice, SkeletonChart } from '@/shared/ui';
import {
  formatDealAmount,
  formatAreaWithPyeong,
  formatDealDateShort,
} from '@/shared/lib';
import type { ITransaction } from '@/entities/transaction';
import {
  PriceTrendChart,
  PeriodToggle,
  ChartEmptyState,
  AreaCompareChart,
  usePriceTrend,
  useAreaComparison,
  TChartPeriodMonths,
  TSelectedAreaGroup,
  IPriceTrendPoint,
} from '@/features/price-chart';
import { DataSourceNotice } from '@/features/trade-history';

interface IAptDetailSummaryProps {
  aptKey: string;
  aptNm: string;
  /** 시군구 표기 — 로컬 데이터로 즉시 렌더 (체감 속도) */
  regionName: string | null;
  builtYear: number | null;
  /** 최신 거래 (해제 제외) — 로드 전 null */
  latestTransaction: ITransaction | null;
  /** 실거래 첫 로드 중 — 가격 영역 스켈레톤 */
  isLoading: boolean;
  /** 평형 비교 ↔ 실거래 리스트 필터 연동 */
  selectedArea: TSelectedAreaGroup;
  onSelectArea: (group: TSelectedAreaGroup) => void;
  /** 실거래 섹션 "N건" 표기 (필터 반영) */
  tradeCount: number;
}

interface IMonthDelta {
  direction: 'up' | 'down' | 'flat';
  amount: number;
  percent: number;
}

/** 마지막 두 비결측 월의 평균가 차이 — 전월 평균 대비 표기 */
const computeMonthDelta = (points: IPriceTrendPoint[]): IMonthDelta | null => {
  const withData = points.filter(
    (point): point is IPriceTrendPoint & { averageAmount: number } =>
      point.averageAmount !== null,
  );
  if (withData.length < 2) return null;

  const latest = withData[withData.length - 1];
  const previous = withData[withData.length - 2];
  const amount = latest.averageAmount - previous.averageAmount;
  if (amount === 0) return { direction: 'flat', amount: 0, percent: 0 };

  return {
    direction: amount > 0 ? 'up' : 'down',
    amount: Math.abs(amount),
    percent: previous.averageAmount > 0 ? Math.abs((amount / previous.averageAmount) * 100) : 0,
  };
};

function MonthDeltaText({ delta }: { delta: IMonthDelta | null }): React.JSX.Element | null {
  if (!delta) return null;
  if (delta.direction === 'flat') {
    return (
      <AppText variant="bodyStrong" tone="sub" className="mt-1">
        — 전월 평균 보합
      </AppText>
    );
  }
  const arrow = delta.direction === 'up' ? '▲' : '▼';
  return (
    <AppText variant="bodyStrong" tone={delta.direction} className="mt-1">
      {arrow} {formatDealAmount(delta.amount)} ({delta.percent.toFixed(1)}%) 전월 평균 대비
    </AppText>
  );
}

export function AptDetailSummary({
  aptKey,
  aptNm,
  regionName,
  builtYear,
  latestTransaction,
  isLoading,
  selectedArea,
  onSelectArea,
  tradeCount,
}: IAptDetailSummaryProps): React.JSX.Element {
  const [period, setPeriod] = useState<TChartPeriodMonths>(12);
  const trend = usePriceTrend(aptKey, period);
  const comparison = useAreaComparison(aptKey);

  const delta = useMemo(() => computeMonthDelta(trend.points), [trend.points]);
  const subtitle = [regionName, builtYear !== null ? `${builtYear}년식` : null]
    .filter((part): part is string => part !== null)
    .join(' · ');

  return (
    <View>
      {/* Summary 블록 — 단지명/지역은 로컬 데이터로 즉시 렌더 */}
      <View className="mt-2 px-5">
        <AppText variant="h1">{aptNm}</AppText>
        {subtitle.length > 0 ? (
          <AppText variant="caption" className="mt-1">
            {subtitle}
          </AppText>
        ) : null}

        <View className="mt-3">
          {isLoading && !latestTransaction ? (
            <SkeletonPrice className="h-9 w-40" />
          ) : latestTransaction ? (
            <>
              <AppText variant="display">
                {formatDealAmount(latestTransaction.dealAmount)}
              </AppText>
              <MonthDeltaText delta={delta} />
              <AppText variant="caption" tone="faint" className="mt-1">
                {formatAreaWithPyeong(latestTransaction.excluUseAr)} ·{' '}
                {latestTransaction.floor}층 · {formatDealDateShort(latestTransaction.dealDate)}{' '}
                계약
              </AppText>
            </>
          ) : (
            <AppText variant="caption" tone="sub">
              최근 거래 내역이 없어요
            </AppText>
          )}
        </View>
      </View>

      {/* 시세 추이 카드 */}
      <Card className="mx-5 mt-5">
        <View className="flex-row items-center justify-between">
          <AppText variant="h2">시세 추이</AppText>
          <PeriodToggle value={period} onChange={setPeriod} />
        </View>
        <View className="mt-3">
          {trend.isLoading ? (
            <SkeletonChart />
          ) : trend.hasEnoughData ? (
            <PriceTrendChart points={trend.points} />
          ) : (
            <ChartEmptyState />
          )}
        </View>
      </Card>

      {/* 평형별 가격 카드 — 평형 1종 이하면 숨김 (빈 비교 차트 금지) */}
      {!comparison.isLoading && comparison.groups.length >= 2 ? (
        <Card className="mx-5 mt-4">
          <AppText variant="h2" className="mb-3">
            평형별 가격
          </AppText>
          <AreaCompareChart
            groups={comparison.groups}
            selected={selectedArea}
            onSelect={onSelectArea}
          />
        </Card>
      ) : null}

      <DataSourceNotice className="mx-5 mt-4" />

      {/* 실거래 섹션 타이틀 */}
      <View className="mt-6 flex-row items-center justify-between px-5 pb-1">
        <AppText variant="h2">실거래 내역</AppText>
        <AppText variant="caption" tone="faint">
          {tradeCount}건
        </AppText>
      </View>
    </View>
  );
}
