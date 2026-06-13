// TanStack Query `select`용 메모이즈 변환 셀렉터.
// 캐시에는 원시 item(파서 출력)이 저장되고, 각 feature는 이 셀렉터로
// ITransaction[]을 파생한다 — 같은 캐시 배열에 대해 변환을 1회만 수행.
import type { IRawTradeItem, ITransaction } from '../types';
import { toTransactions } from './transform';

type TTransactionsSelector = (items: readonly IRawTradeItem[]) => ITransaction[];

const selectorByLawdCd = new Map<string, TTransactionsSelector>();

/**
 * lawdCd별 변환 셀렉터 — 셀렉터 참조가 안정적이어야 TanStack Query가
 * select 결과를 메모이즈한다. 입력 배열(WeakMap 키) 단위로 결과를 캐싱.
 */
export const getTransactionsSelector = (lawdCd: string): TTransactionsSelector => {
  const cached = selectorByLawdCd.get(lawdCd);
  if (cached) return cached;

  const resultCache = new WeakMap<object, ITransaction[]>();
  const selector: TTransactionsSelector = (items) => {
    const memo = resultCache.get(items);
    if (memo) return memo;
    const result = toTransactions([...items], lawdCd);
    resultCache.set(items, result);
    return result;
  };

  selectorByLawdCd.set(lawdCd, selector);
  return selector;
};
