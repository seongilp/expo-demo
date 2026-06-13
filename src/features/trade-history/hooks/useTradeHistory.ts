// 단지 실거래 내역 — aptKey(aptNm 정규화 매칭) 필터 + 월 단위 무한 로드 (F-002).
// 최근 12개월 우선 로드, "이전 거래 더 보기"로 6개월씩 최대 24개월까지 확장.
// 월 쿼리는 시군구 단위 캐시를 공유하므로 같은 지역의 다른 단지 조회 시 즉시 적중.
import { useCallback, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { recentDealYms, formatMonthTitle } from '@/shared/lib';
import { EVENTS, logEvent } from '@/shared/analytics';
import { parseAptKey, isSameAptName } from '@/entities/apartment';
import type { ITransaction } from '@/entities/transaction';
import type { ITradeMonthSection, ITradeHistoryMeta, TTradeLoadState } from '../types';
import { monthlyTransactionsQuery } from '../api';

export const INITIAL_MONTHS = 12;
export const MAX_MONTHS = 24;
const LOAD_STEP_MONTHS = 6;

export interface IUseTradeHistoryResult {
  /** 월 내림차순 섹션 (거래 없는 월 제외) */
  sections: ITradeMonthSection[];
  loadState: TTradeLoadState;
  meta: ITradeHistoryMeta;
  /** 최종 실패한 월 쿼리 수 — 0이 아니면 비차단 안내 노출 (캐시는 그대로 표시) */
  failedMonths: number;
  /** 과거 월 추가 로드 (최대 24개월) */
  loadMore: () => void;
}

const byDealDateDesc = (a: ITransaction, b: ITransaction): number =>
  b.dealDate.localeCompare(a.dealDate);

const buildSections = (
  transactions: readonly ITransaction[],
  aptNm: string,
): ITradeMonthSection[] => {
  const matched = transactions.filter((transaction) => isSameAptName(transaction.aptNm, aptNm));
  const grouped = matched.reduce<Map<string, ITransaction[]>>((map, transaction) => {
    const group = map.get(transaction.monthKey) ?? [];
    return new Map(map).set(transaction.monthKey, [...group, transaction]);
  }, new Map());

  return Array.from(grouped.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, group]) => ({
      monthKey,
      title: formatMonthTitle(monthKey),
      transactions: [...group].sort(byDealDateDesc),
    }));
};

export const useTradeHistory = (aptKey: string): IUseTradeHistoryResult => {
  const [loadedMonths, setLoadedMonths] = useState(INITIAL_MONTHS);

  // parseAptKey는 순수 함수 — aptKey 기준으로만 재계산
  const parsed = useMemo(() => parseAptKey(aptKey), [aptKey]);

  const dealYms = useMemo(
    () => (parsed ? recentDealYms(loadedMonths) : []),
    [parsed, loadedMonths],
  );

  const results = useQueries({
    queries: dealYms.map((dealYmd) => monthlyTransactionsQuery(parsed?.lawdCd ?? '', dealYmd)),
  });

  const loadMore = useCallback(() => {
    const next = Math.min(loadedMonths + LOAD_STEP_MONTHS, MAX_MONTHS);
    if (next === loadedMonths) return;
    setLoadedMonths(next);
    if (parsed) {
      // 과거 월 추가 로드 깊이 — 사용자가 얼마나 과거까지 탐색하는지 측정 (F-002)
      logEvent(EVENTS.LOAD_MORE_TRADES, { lawd_cd: parsed.lawdCd, month_depth: next });
    }
  }, [loadedMonths, parsed]);

  return useMemo<IUseTradeHistoryResult>(() => {
    const meta: ITradeHistoryMeta = {
      loadedMonths,
      hasMore: loadedMonths < MAX_MONTHS,
    };

    if (!parsed) {
      return { sections: [], loadState: 'error', meta, failedMonths: 0, loadMore };
    }

    const initialPending = results
      .slice(0, Math.min(INITIAL_MONTHS, results.length))
      .some((result) => result.isPending);
    const morePending = results.slice(INITIAL_MONTHS).some((result) => result.isPending);
    const failedMonths = results.filter((result) => result.isError).length;

    const merged = results.flatMap((result) => result.data ?? []);
    const sections = buildSections(merged, parsed.aptNm);

    const allFailed = results.length > 0 && failedMonths === results.length;
    const loadState: TTradeLoadState = initialPending
      ? 'loading'
      : morePending
        ? 'loading-more'
        : allFailed
          ? 'error'
          : 'success';

    return { sections, loadState, meta, failedMonths, loadMore };
  }, [results, loadedMonths, parsed, loadMore]);
};
