// features/trade-history — 실거래 내역 조회 (F-002, F-012)
export type { ITradeMonthSection, TTradeLoadState, ITradeHistoryMeta } from './types';
export { monthlyTransactionsQuery } from './api';
export { useMonthlyTrades, useTradeHistory, INITIAL_MONTHS, MAX_MONTHS } from './hooks';
export type { IUseTradeHistoryResult } from './hooks';
export {
  TransactionList,
  TransactionItem,
  CanceledBadge,
  DataSourceNotice,
  DATA_SOURCE_NOTICE_TEXT,
} from './ui';
