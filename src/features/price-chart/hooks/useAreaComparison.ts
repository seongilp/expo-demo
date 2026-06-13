// 평형(면적 구간)별 가격 비교 (F-004) — entities/transaction 집계 셀렉터 기반.
// 같은 반올림 평수의 거래를 하나의 구간으로 클러스터링해 평균/최근 거래가를 비교한다.
// 1개 구간뿐이면 차트 대신 단일 요약을 그리는 분기는 UI([4c]) 책임.
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { recentDealYms } from '@/shared/lib';
import { monthlyTradesQueryOptions } from '@/shared/api';
import { aggregateByAreaGroup, getTransactionsSelector } from '@/entities/transaction';
import { parseAptKey, isSameAptName } from '@/entities/apartment';
import type { IAreaGroupStat } from '@/entities/transaction';
import type { TChartPeriodMonths } from '../types';

/**
 * 평형 비교 기본 집계 기간 — 12개월.
 * trade-history 점진 로드(R-2 쿼터 절약)와 동일 정책: 첫 진입 시 24개월 즉시 조회로
 * 쿼터 절약 정책을 무력화하지 않도록 12개월로 맞춘다 (같은 시군구 캐시 공유).
 */
export const DEFAULT_COMPARISON_MONTHS: TChartPeriodMonths = 12;

export interface IUseAreaComparisonResult {
  /** 평수 오름차순 구간 통계 */
  groups: IAreaGroupStat[];
  isLoading: boolean;
  isError: boolean;
}

export const useAreaComparison = (
  aptKey: string,
  periodMonths: TChartPeriodMonths = DEFAULT_COMPARISON_MONTHS,
): IUseAreaComparisonResult => {
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
      return { groups: [], isLoading: false, isError: true };
    }

    const merged = results
      .flatMap((result) => result.data ?? [])
      .filter((transaction) => isSameAptName(transaction.aptNm, parsed.aptNm));

    return {
      groups: aggregateByAreaGroup(merged),
      isLoading: results.some((result) => result.isPending),
      isError: results.length > 0 && results.every((result) => result.isError),
    };
  }, [results, parsed]);
};
