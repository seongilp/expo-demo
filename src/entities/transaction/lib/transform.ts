// 파싱된 API item → ITransaction 변환 (해제여부/거래유형 매핑, 금액/면적 정규화).
import { parseDealAmount, toDateKey, toDayjs, DATE_KEY_FORMAT } from '@/shared/lib/format';
import { ETradeType, IRawTradeItem, ITransaction } from '../types';

const toNumber = (value: string | number | undefined): number | null => {
  if (value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const toAmount = (value: string | number): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }
  return parseDealAmount(value);
};

const toTradeType = (dealingGbn: string | undefined): ETradeType =>
  dealingGbn?.trim() === ETradeType.DIRECT ? ETradeType.DIRECT : ETradeType.BROKERAGE;

const isCanceledDeal = (item: IRawTradeItem): boolean => {
  const flag = item.cdealType?.trim();
  const hasCancelDay = Boolean(item.cdealDay && String(item.cdealDay).trim().length > 0);
  return flag === 'O' || hasCancelDay;
};

/**
 * 원시 거래 item → ITransaction. 필수 필드가 비정상이면 null (시스템 경계 검증).
 * @param lawdCd 조회에 사용한 시군구 코드 (응답 sggCd보다 우선)
 */
export const toTransaction = (item: IRawTradeItem, lawdCd: string): ITransaction | null => {
  const aptNm = item.aptNm?.trim();
  if (!aptNm) return null;

  const dealAmount = toAmount(item.dealAmount);
  const excluUseAr = toNumber(item.excluUseAr);
  const year = toNumber(item.dealYear);
  const month = toNumber(item.dealMonth);
  const day = toNumber(item.dealDay);
  if (dealAmount === null || excluUseAr === null || excluUseAr <= 0) return null;
  if (year === null || month === null || day === null) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const dealDate = toDateKey(year, month, day);
  const parsedDate = toDayjs(dealDate, DATE_KEY_FORMAT);
  if (!parsedDate.isValid()) return null;

  const floor = toNumber(item.floor) ?? 0;
  const umdNm = item.umdNm?.trim() || null;

  return {
    id: `${lawdCd}:${aptNm}:${dealDate}:${floor}:${excluUseAr}:${dealAmount}`,
    lawdCd,
    aptNm,
    dealAmount,
    excluUseAr,
    floor,
    buildYear: toNumber(item.buildYear),
    dealDate,
    monthKey: parsedDate.format('YYYY-MM'),
    tradeType: toTradeType(item.dealingGbn),
    isCanceled: isCanceledDeal(item),
    umdNm,
  };
};

/** item 목록 일괄 변환 — 비정상 항목은 제외 */
export const toTransactions = (items: IRawTradeItem[], lawdCd: string): ITransaction[] =>
  items
    .map((item) => toTransaction(item, lawdCd))
    .filter((transaction): transaction is ITransaction => transaction !== null);
