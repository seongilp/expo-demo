// 월별 평균가 / 평형(면적 구간)별 집계 셀렉터 (F-003/F-004 데이터 소스).
// 해제된 거래(isCanceled)는 모든 집계에서 제외한다.
import { toPyeongRounded } from '@/shared/lib/format';
import type { IAreaGroupStat, IMonthlyAverage, ITransaction } from '../types';

const activeOnly = (transactions: readonly ITransaction[]): ITransaction[] =>
  transactions.filter((transaction) => !transaction.isCanceled);

const average = (values: readonly number[]): number =>
  values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

/**
 * 월별 평균 거래금액 집계 — monthKey 오름차순.
 * 거래가 없는 월은 결과에 포함되지 않는다 (결측 월 라인 단절 처리는 차트 레이어 책임).
 */
export const aggregateMonthly = (transactions: readonly ITransaction[]): IMonthlyAverage[] => {
  const grouped = activeOnly(transactions).reduce<Map<string, number[]>>((map, transaction) => {
    const amounts = map.get(transaction.monthKey) ?? [];
    return new Map(map).set(transaction.monthKey, [...amounts, transaction.dealAmount]);
  }, new Map());

  return Array.from(grouped.entries())
    .map(([monthKey, amounts]) => ({
      monthKey,
      averageAmount: average(amounts),
      count: amounts.length,
    }))
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
};

const byDealDateDesc = (a: ITransaction, b: ITransaction): number =>
  b.dealDate.localeCompare(a.dealDate);

/**
 * 평형(전용면적 환산 평수 반올림)별 집계 — 평수 오름차순.
 * 같은 반올림 평수의 거래를 하나의 구간으로 클러스터링한다.
 */
export const aggregateByAreaGroup = (transactions: readonly ITransaction[]): IAreaGroupStat[] => {
  const grouped = activeOnly(transactions).reduce<Map<number, ITransaction[]>>(
    (map, transaction) => {
      const pyeong = toPyeongRounded(transaction.excluUseAr);
      const group = map.get(pyeong) ?? [];
      return new Map(map).set(pyeong, [...group, transaction]);
    },
    new Map(),
  );

  return Array.from(grouped.entries())
    .map(([pyeong, group]) => {
      const sorted = [...group].sort(byDealDateDesc);
      const latest = sorted[0];
      const areas = group.map((transaction) => transaction.excluUseAr);
      return {
        pyeong,
        label: `${pyeong}평`,
        minArea: Math.min(...areas),
        maxArea: Math.max(...areas),
        count: group.length,
        averageAmount: average(group.map((transaction) => transaction.dealAmount)),
        latestAmount: latest.dealAmount,
        latestDealDate: latest.dealDate,
      };
    })
    .sort((a, b) => a.pyeong - b.pyeong);
};
