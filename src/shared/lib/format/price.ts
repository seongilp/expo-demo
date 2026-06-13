// 거래금액 포맷터 — 국토부 API 거래금액은 만원 단위.
// "124,500"(콤마 문자열) → 124500(만원) → "12억 4,500"

const MANWON_PER_EOK = 10_000;

/** 콤마 포함 금액 문자열을 만원 단위 number로 정규화. 비정상 입력은 null. */
export const parseDealAmount = (raw: string): number | null => {
  const cleaned = raw.replace(/[,\s]/g, '');
  if (cleaned.length === 0) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
};

/**
 * 만원 단위 금액 → "12억 4,500" / 1억 미만 → "9,500만"
 * 억 단위 끝자리가 0이면 "12억"으로 축약.
 */
export const formatDealAmount = (amountManwon: number): string => {
  if (!Number.isFinite(amountManwon) || amountManwon < 0) return '-';
  const eok = Math.floor(amountManwon / MANWON_PER_EOK);
  const rest = Math.round(amountManwon % MANWON_PER_EOK);

  if (eok === 0) return `${rest.toLocaleString('ko-KR')}만`;
  if (rest === 0) return `${eok.toLocaleString('ko-KR')}억`;
  return `${eok.toLocaleString('ko-KR')}억 ${rest.toLocaleString('ko-KR')}`;
};

/** 차트 Y축용 축약 — "12억", "12.5억", 1억 미만 "9500만" */
export const formatEokShort = (amountManwon: number): string => {
  if (!Number.isFinite(amountManwon) || amountManwon < 0) return '-';
  if (amountManwon < MANWON_PER_EOK) return `${Math.round(amountManwon)}만`;
  const eok = amountManwon / MANWON_PER_EOK;
  const rounded = Math.round(eok * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}억` : `${rounded.toFixed(1)}억`;
};
