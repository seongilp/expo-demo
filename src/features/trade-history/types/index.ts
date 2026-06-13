import type { ITransaction } from '@/entities/transaction';

/** 실거래 리스트의 월 그룹 섹션 (FlashList 섹션 데이터) */
export interface ITradeMonthSection {
  /** YYYY-MM */
  monthKey: string;
  /** 섹션 헤더 표기 (예: "2026년 5월") */
  title: string;
  transactions: ITransaction[];
}

/** 실거래 로드 상태 */
export type TTradeLoadState = 'idle' | 'loading' | 'loading-more' | 'success' | 'error';

/** 무한 월 로드 메타 */
export interface ITradeHistoryMeta {
  /** 현재까지 로드한 개월 수 */
  loadedMonths: number;
  /** 추가 로드 가능 여부 (최대 24개월) */
  hasMore: boolean;
}
