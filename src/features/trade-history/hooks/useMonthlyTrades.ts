// 시군구×월 단건 실거래 useQuery (F-002).
// 캐시 우선 + stale-while-revalidate — staleTime 정책은 shared(과거 월 Infinity /
// 당월·직전월 6h). 실패 시에도 기존 캐시 data가 유지되므로 UI는 캐시를 표시하고
// `isError`로 비차단 안내만 띄운다.
import { useQuery } from '@tanstack/react-query';
import { monthlyTransactionsQuery } from '../api';

/** @returns data: ITransaction[] (select 변환) — 해제 거래 포함 (뱃지 표시는 UI 책임) */
export const useMonthlyTrades = (lawdCd: string, dealYmd: string) =>
  useQuery(monthlyTransactionsQuery(lawdCd, dealYmd));
