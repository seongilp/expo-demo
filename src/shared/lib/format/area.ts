// 전용면적 포맷터 — ㎡ ↔ 평 변환 및 병기 표기

const SQM_PER_PYEONG = 3.305785;

/** ㎡ → 평 (소수 그대로) */
export const toPyeong = (squareMeters: number): number => squareMeters / SQM_PER_PYEONG;

/** ㎡ → 반올림 평수 (리스트/뱃지 표기용) */
export const toPyeongRounded = (squareMeters: number): number =>
  Math.round(toPyeong(squareMeters));

/** "84.92㎡" */
export const formatSquareMeters = (squareMeters: number): string => {
  if (!Number.isFinite(squareMeters) || squareMeters <= 0) return '-';
  return `${squareMeters.toFixed(2).replace(/\.?0+$/, '')}㎡`;
};

/** "84.92㎡ · 25평" — TransactionItem 병기 포맷 */
export const formatAreaWithPyeong = (squareMeters: number): string => {
  if (!Number.isFinite(squareMeters) || squareMeters <= 0) return '-';
  return `${formatSquareMeters(squareMeters)} · ${toPyeongRounded(squareMeters)}평`;
};

/** "25평" — 평형 비교 차트 라벨 */
export const formatPyeongLabel = (squareMeters: number): string => {
  if (!Number.isFinite(squareMeters) || squareMeters <= 0) return '-';
  return `${toPyeongRounded(squareMeters)}평`;
};
