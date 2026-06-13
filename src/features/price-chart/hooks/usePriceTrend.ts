// 월별 평균 매매가 추이 (F-003) — entities/transaction 집계 셀렉터 기반.
// 결측 월(거래 없음)은 averageAmount=null 포인트로 포함해 라인 단절 처리 —
// 0으로 그리지 않는다 (차트 레이어 계약).
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { recentDealYms, dealYmToMonthKey } from '@/shared/lib';
import { monthlyTradesQueryOptions } from '@/shared/api';
import { aggregateMonthly, getTransactionsSelector } from '@/entities/transaction';
import { parseAptKey, isSameAptName } from '@/entities/apartment';
import type { IPriceTrendPoint, TChartPeriodMonths } from '../types';

/** "거래가 부족합니다" 빈 상태 기준 — 데이터 있는 월 2개 미만 (ChartEmptyState) */
export const MIN_MONTHS_WITH_DATA = 2;

export interface IUsePriceTrendResult {
  /** 기간 전체의 연속 월 포인트 (오름차순) — 결측 월은 averageAmount=null */
  points: IPriceTrendPoint[];
  /** 거래 데이터가 있는 월 수 */
  monthsWithData: number;
  /** 차트 렌더 가능 여부 (2개월 이상) — 미만이면 ChartEmptyState */
  hasEnoughData: boolean;
  isLoading: boolean;
  isError: boolean;
}

export const usePriceTrend = (
  aptKey: string,
  periodMonths: TChartPeriodMonths,
): IUsePriceTrendResult => {
  const parsed = useMemo(() => parseAptKey(aptKey), [aptKey]);
  const dealYms = useMemo(
    () => (parsed ? recentDealYms(periodMonths) : []),
    [parsed, periodMonths],
  );

  const results = useQueries({
    queries: dealYms.map((dealYmd) => ({
      ...monthlyTradesQueryOptions(parsed?.lawdCd ?? '', dealYmd),
      select: getTransactionsSelector(parsed?.lawdCd ?? ''),
    })),
  });

  return useMemo(() => {
    if (!parsed) {
      return {
        points: [],
        monthsWithData: 0,
        hasEnoughData: false,
        isLoading: false,
        isError: true,
      };
    }

    const merged = results
      .flatMap((result) => result.data ?? [])
      .filter((transaction) => isSameAptName(transaction.aptNm, parsed.aptNm));
    const monthlyAverages = aggregateMonthly(merged);
    const averageByMonth = new Map(
      monthlyAverages.map((entry) => [entry.monthKey, entry] as const),
    );

    // 기간 전체 연속 월 시퀀스 (오름차순) — 결측 월은 null 포인트
    const points: IPriceTrendPoint[] = [...dealYms].reverse().map((dealYmd) => {
      const monthKey = dealYmToMonthKey(dealYmd);
      const aggregated = averageByMonth.get(monthKey);
      return {
        monthKey,
        averageAmount: aggregated?.averageAmount ?? null,
        count: aggregated?.count ?? 0,
      };
    });

    const monthsWithData = monthlyAverages.length;
    return {
      points,
      monthsWithData,
      hasEnoughData: monthsWithData >= MIN_MONTHS_WITH_DATA,
      isLoading: results.some((result) => result.isPending),
      isError: results.length > 0 && results.every((result) => result.isError),
    };
  }, [results, parsed, dealYms]);
};
