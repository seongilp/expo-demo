// dayjs 기반 날짜 유틸 — 국토부 API DEAL_YMD(YYYYMM) 및 계약일 표기.
// 디바이스 로컬 시간 기준. `new Date().toISOString().split('T')[0]` 금지 (UTC 어긋남).
import dayjs, { Dayjs } from 'dayjs';

export const DEAL_YM_FORMAT = 'YYYYMM';
export const MONTH_KEY_FORMAT = 'YYYY-MM';
export const DATE_KEY_FORMAT = 'YYYY-MM-DD';

/** 오늘 날짜 (로컬, YYYY-MM-DD) */
export const today = (): string => dayjs().format(DATE_KEY_FORMAT);

/** 이번 달 DEAL_YMD (YYYYMM) */
export const currentDealYm = (): string => dayjs().format(DEAL_YM_FORMAT);

/** N개월 전 DEAL_YMD (YYYYMM) */
export const dealYmMonthsAgo = (months: number): string =>
  dayjs().subtract(months, 'month').format(DEAL_YM_FORMAT);

/** 최근 N개월 DEAL_YMD 목록 — 최신월부터 내림차순 (당월 포함) */
export const recentDealYms = (count: number): string[] => {
  const now = dayjs();
  return Array.from({ length: Math.max(0, count) }, (_, index) =>
    now.subtract(index, 'month').format(DEAL_YM_FORMAT),
  );
};

/** 'YYYYMM' → 'YYYY-MM' 월 키 */
export const dealYmToMonthKey = (dealYm: string): string =>
  dayjs(dealYm, DEAL_YM_FORMAT).format(MONTH_KEY_FORMAT);

/** 연/월/일 숫자 → 'YYYY-MM-DD' (국토부 dealYear/dealMonth/dealDay 조합) */
export const toDateKey = (year: number, month: number, day: number): string =>
  dayjs(new Date(year, month - 1, day)).format(DATE_KEY_FORMAT);

/** 'YYYY-MM-DD' → '5.21.' (TransactionItem 계약일 표기) */
export const formatDealDateShort = (dateKey: string): string => {
  const parsed = dayjs(dateKey, DATE_KEY_FORMAT);
  if (!parsed.isValid()) return '-';
  return `${parsed.month() + 1}.${parsed.date()}.`;
};

/** 'YYYY-MM' → '2026년 5월' (월 섹션 헤더) */
export const formatMonthTitle = (monthKey: string): string => {
  const parsed = dayjs(monthKey, MONTH_KEY_FORMAT);
  if (!parsed.isValid()) return '-';
  return `${parsed.year()}년 ${parsed.month() + 1}월`;
};

/** 'YYYY-MM-DD'가 최근 N일 이내인지 (new 뱃지 판정 등) */
export const isWithinDays = (dateKey: string, days: number): boolean => {
  const parsed = dayjs(dateKey, DATE_KEY_FORMAT);
  if (!parsed.isValid()) return false;
  return dayjs().diff(parsed, 'day') <= days;
};

/** 외부에서 dayjs 인스턴스가 필요한 경우의 단일 진입점 */
export const toDayjs = (value: string, format?: string): Dayjs =>
  format ? dayjs(value, format) : dayjs(value);
