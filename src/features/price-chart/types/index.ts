/** 차트 기간 (개월) — 12/24 토글 */
export type TChartPeriodMonths = 12 | 24;

/** 월별 평균 추이 포인트 — 결측 월은 averageAmount=null (라인 단절, 0으로 그리지 않음) */
export interface IPriceTrendPoint {
  /** YYYY-MM */
  monthKey: string;
  /** 평균 거래금액(만원) — 해당 월 거래 없으면 null */
  averageAmount: number | null;
  /** 거래 건수 */
  count: number;
}

/** 평형 비교 차트에서 선택된 구간 (대표 평수) — null이면 전체 */
export type TSelectedAreaGroup = number | null;
