// 지역 단지 리스트 (F-008) — 최근 3개월 실거래 응답 aptNm 그룹핑 + 로컬 번들 하이브리드.
// 실거래에 등장한 단지를 최근 거래일 순으로 먼저, 거래 없는 번들 단지를 뒤에 붙인다.
// 월 쿼리 캐시(['trades', lawdCd, ym])는 단지 상세(F-002)와 공유된다.
import { useCallback, useMemo } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { recentDealYms } from '@/shared/lib';
import { monthlyTradesQueryOptions, tradeKeys } from '@/shared/api';
import { getTransactionsSelector, ITransaction } from '@/entities/transaction';
import {
  getApartmentsByRegion,
  makeAptKey,
  normalizeAptName,
  isSameAptName,
} from '@/entities/apartment';
import type { IRegionAptListItem } from '../types';

const RECENT_MONTHS = 3;

export interface IUseRegionAptListResult {
  items: IRegionAptListItem[];
  isLoading: boolean;
  /** 모든 월 쿼리가 최종 실패 (캐시도 없음) — 재시도 버튼 노출 */
  isError: boolean;
  /** 실패 쿼리 재시도 (F-008 재시도 버튼) */
  retry: () => void;
}

interface IAptGroup {
  /** 표시 단지명 — 가장 최근 거래의 표기 사용 */
  aptNm: string;
  buildYear: number | null;
  latestDealAmount: number;
  latestDealDate: string;
  tradeCount: number;
}

const groupByApartment = (transactions: readonly ITransaction[]): IAptGroup[] => {
  const grouped = transactions
    .filter((transaction) => !transaction.isCanceled)
    .reduce<Map<string, ITransaction[]>>((map, transaction) => {
      const key = normalizeAptName(transaction.aptNm);
      if (key.length === 0) return map;
      const group = map.get(key) ?? [];
      return new Map(map).set(key, [...group, transaction]);
    }, new Map());

  return Array.from(grouped.values()).map((group) => {
    const latest = [...group].sort((a, b) => b.dealDate.localeCompare(a.dealDate))[0];
    return {
      aptNm: latest.aptNm,
      buildYear: latest.buildYear,
      latestDealAmount: latest.dealAmount,
      latestDealDate: latest.dealDate,
      tradeCount: group.length,
    };
  });
};

const buildItems = (lawdCd: string, transactions: readonly ITransaction[]): IRegionAptListItem[] => {
  const bundled = getApartmentsByRegion(lawdCd);
  const groups = groupByApartment(transactions);

  const traded = groups.reduce<IRegionAptListItem[]>((acc, group) => {
    const aptKey = makeAptKey(lawdCd, group.aptNm);
    if (!aptKey) return acc;
    const bundledMatch = bundled.find((apartment) => isSameAptName(apartment.aptNm, group.aptNm));
    return [
      ...acc,
      {
        aptKey,
        aptNm: group.aptNm,
        lawdCd,
        builtYear: bundledMatch?.builtYear ?? group.buildYear,
        latestDealAmount: group.latestDealAmount,
        latestDealDate: group.latestDealDate,
        tradeCount: group.tradeCount,
      },
    ];
  }, []);

  // 번들에는 있으나 최근 3개월 거래가 없는 단지 — 리스트 뒤에 가나다순으로
  const tradedNames = new Set(traded.map((item) => normalizeAptName(item.aptNm)));
  const bundledOnly = bundled
    .filter((apartment) => !tradedNames.has(normalizeAptName(apartment.aptNm)))
    .map<IRegionAptListItem>((apartment) => ({
      aptKey: apartment.aptKey,
      aptNm: apartment.aptNm,
      lawdCd,
      builtYear: apartment.builtYear,
      latestDealAmount: null,
      latestDealDate: null,
      tradeCount: 0,
    }))
    .sort((a, b) => a.aptNm.localeCompare(b.aptNm, 'ko'));

  const tradedSorted = [...traded].sort((a, b) =>
    (b.latestDealDate ?? '').localeCompare(a.latestDealDate ?? ''),
  );

  return [...tradedSorted, ...bundledOnly];
};

export const useRegionAptList = (lawdCd: string): IUseRegionAptListResult => {
  const queryClient = useQueryClient();
  const dealYms = useMemo(() => recentDealYms(RECENT_MONTHS), []);
  const selector = getTransactionsSelector(lawdCd);

  const results = useQueries({
    queries: dealYms.map((dealYmd) => ({
      ...monthlyTradesQueryOptions(lawdCd, dealYmd),
      select: selector,
    })),
  });

  const retry = useCallback(() => {
    void queryClient.refetchQueries({
      queryKey: tradeKeys.all,
      predicate: (query) => query.queryKey[1] === lawdCd && query.state.status === 'error',
    });
  }, [queryClient, lawdCd]);

  return useMemo(() => {
    const merged = results.flatMap((result) => result.data ?? []);
    const isLoading = results.some((result) => result.isPending);
    const isError =
      results.length > 0 && results.every((result) => result.isError) && merged.length === 0;

    return {
      items: isLoading && merged.length === 0 ? [] : buildItems(lawdCd, merged),
      isLoading,
      isError,
      retry,
    };
  }, [results, lawdCd, retry]);
};
