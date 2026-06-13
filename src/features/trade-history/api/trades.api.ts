// 시군구×월 실거래 쿼리 옵션 — shared/api `getTrades` 경유 + entities/transaction 변환 래핑.
// 캐시 키 `['trades', lawdCd, dealYmd]`는 shared 팩토리를 공유해 지역 리스트(F-008)와
// 동일 캐시에 적중한다. 캐시 값은 원시 item, ITransaction 변환은 select에서 수행.
import { monthlyTradesQueryOptions } from '@/shared/api';
import { getTransactionsSelector } from '@/entities/transaction';

/**
 * 월별 실거래(ITransaction[]) 쿼리 옵션.
 * staleTime은 shared 정책(과거 월 Infinity / 당월·직전월 6h)을 그대로 따른다.
 */
export const monthlyTransactionsQuery = (lawdCd: string, dealYmd: string) => ({
  ...monthlyTradesQueryOptions(lawdCd, dealYmd),
  select: getTransactionsSelector(lawdCd),
});
