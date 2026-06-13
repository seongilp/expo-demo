// 캐시 키 팩토리 + staleTime 정책 (02-data-layer).
// 시군구×월 단위 쿼리 키 `['trades', lawdCd, dealYmd]` — 지역 리스트(F-008)/
// 단지 상세(F-002)/차트(F-003,4)/관심 요약(F-005)이 모두 같은 캐시를 공유한다.
import dayjs from 'dayjs';
import { queryOptions } from '@tanstack/react-query';
import { getTrades } from '../molit';
import type { TRawTradeItemDto } from '../molit';

/** 신고 기한(30일) 미완결 월의 staleTime — 6시간 */
export const UNSETTLED_MONTH_STALE_TIME_MS = 6 * 60 * 60 * 1000;
/** 실거래 쿼리 gcTime — persist 복원 윈도우(30일)와 동일하게 유지 */
export const TRADES_GC_TIME_MS = 30 * 24 * 60 * 60 * 1000;

export const tradeKeys = {
  all: ['trades'] as const,
  month: (lawdCd: string, dealYmd: string) => ['trades', lawdCd, dealYmd] as const,
};

/**
 * 월별 staleTime 정책 (R-2 쿼터 절약):
 * - 과거 월(직전월 이전): 신고가 완결된 불변 데이터 → Infinity (persist 장기 캐시)
 * - 당월·직전월: 신고 지연(최대 30일)으로 미완결 → 6h
 */
export const tradesStaleTime = (dealYmd: string): number => {
  const previousMonth = dayjs().subtract(1, 'month').format('YYYYMM');
  return dealYmd >= previousMonth ? UNSETTLED_MONTH_STALE_TIME_MS : Number.POSITIVE_INFINITY;
};

/**
 * 시군구×월 실거래 쿼리 옵션 — 모든 feature가 이 옵션을 공유해
 * 캐시 정합(동일 키 = 동일 queryFn/데이터 형태)을 보장한다.
 * 캐시 값은 검증된 원시 item 배열 — 도메인 변환(ITransaction)은 각 feature의
 * `select`에서 entities/transaction으로 수행한다 (FSD: shared는 entities를 모름).
 */
export const monthlyTradesQueryOptions = (lawdCd: string, dealYmd: string) =>
  queryOptions<TRawTradeItemDto[]>({
    queryKey: tradeKeys.month(lawdCd, dealYmd),
    queryFn: async () => {
      const { items } = await getTrades({ lawdCd, dealYmd });
      return items;
    },
    staleTime: tradesStaleTime(dealYmd),
    gcTime: TRADES_GC_TIME_MS,
    retry: false, // 전송 계층에서 이미 1회 재시도 — 이중 재시도 금지 (요청 폭주 방지)
  });
