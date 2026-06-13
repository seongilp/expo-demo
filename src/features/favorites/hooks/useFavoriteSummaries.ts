// 관심 단지별 최신 거래 요약 (F-005 홈 카드) — 캐시 우선 표시 + 백그라운드 갱신.
// 시군구 단위 월 쿼리(['trades', lawdCd, ym])를 공유하므로 같은 지역의 관심 단지
// 여러 개도 추가 호출 없이 캐시에 적중한다 (R-2 쿼터 절약).
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { recentDealYms } from '@/shared/lib';
import { monthlyTradesQueryOptions } from '@/shared/api';
import { getTransactionsSelector, ITransaction } from '@/entities/transaction';
import { isSameAptName } from '@/entities/apartment';
import type { IFavoriteSummary } from '../types';
import { useFavoritesStore } from '../store';

/** 요약 조회 범위 — 최근 3개월 (없으면 latest=null로 표기) */
const SUMMARY_MONTHS = 3;

export interface IUseFavoriteSummariesResult {
  /** aptKey → 요약. 키 부재 = 아직 로딩 전 */
  summaries: Record<string, IFavoriteSummary>;
  /** 첫 로드 중 여부 — 캐시가 있으면 즉시 표시되고 백그라운드 갱신만 수행 */
  isLoading: boolean;
}

const findLatest = (
  transactions: readonly ITransaction[],
  aptNm: string,
): ITransaction | null => {
  const matched = transactions.filter(
    (transaction) => !transaction.isCanceled && isSameAptName(transaction.aptNm, aptNm),
  );
  if (matched.length === 0) return null;
  return [...matched].sort((a, b) => b.dealDate.localeCompare(a.dealDate))[0];
};

export const useFavoriteSummaries = (): IUseFavoriteSummariesResult => {
  const favorites = useFavoritesStore((state) => state.favorites);

  const lawdCds = useMemo(
    () => Array.from(new Set(favorites.map((favorite) => favorite.lawdCd))),
    [favorites],
  );
  const dealYms = useMemo(() => recentDealYms(SUMMARY_MONTHS), []);

  const queryPairs = useMemo(
    () =>
      lawdCds.flatMap((lawdCd) => dealYms.map((dealYmd) => ({ lawdCd, dealYmd }))),
    [lawdCds, dealYms],
  );

  const results = useQueries({
    queries: queryPairs.map(({ lawdCd, dealYmd }) => ({
      ...monthlyTradesQueryOptions(lawdCd, dealYmd),
      select: getTransactionsSelector(lawdCd),
    })),
  });

  return useMemo(() => {
    // lawdCd별로 머지된 거래 묶음 구성
    const byLawdCd = queryPairs.reduce<Map<string, ITransaction[]>>((map, pair, index) => {
      const data = results[index]?.data ?? [];
      const merged = [...(map.get(pair.lawdCd) ?? []), ...data];
      return new Map(map).set(pair.lawdCd, merged);
    }, new Map());

    const summaries = favorites.reduce<Record<string, IFavoriteSummary>>((acc, favorite) => {
      const transactions = byLawdCd.get(favorite.lawdCd) ?? [];
      const latest = findLatest(transactions, favorite.aptNm);
      return {
        ...acc,
        [favorite.aptKey]: {
          aptKey: favorite.aptKey,
          latest: latest
            ? {
                dealAmount: latest.dealAmount,
                excluUseAr: latest.excluUseAr,
                dealDate: latest.dealDate,
                floor: latest.floor,
              }
            : null,
        },
      };
    }, {});

    return {
      summaries,
      isLoading: results.some((result) => result.isPending),
    };
  }, [results, queryPairs, favorites]);
};
