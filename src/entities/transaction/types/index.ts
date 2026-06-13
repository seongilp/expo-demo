// 실거래 도메인 모델 — 국토부 아파트 매매 실거래가 API 기준.
// entities/transaction은 shared에만 의존한다 (region/apartment 비참조).

/** 거래유형 (dealingGbn) */
export enum ETradeType {
  /** 중개거래 (기본값 — 뱃지 미표시) */
  BROKERAGE = '중개거래',
  /** 직거래 (warning 뱃지) */
  DIRECT = '직거래',
}

/**
 * XML 파싱 직후의 원시 거래 item (shared/api/molit parser 출력 — 02-data-layer).
 * fast-xml-parser 설정에 따라 숫자형 필드가 number로 올 수 있어 union 허용.
 */
export interface IRawTradeItem {
  aptNm: string;
  /** 거래금액 — 콤마 포함 만원 문자열 (예: " 124,500") */
  dealAmount: string | number;
  /** 전용면적(㎡) */
  excluUseAr: string | number;
  dealYear: string | number;
  dealMonth: string | number;
  dealDay: string | number;
  floor: string | number;
  buildYear?: string | number;
  /** 해제여부 — 'O'면 해제된 거래 */
  cdealType?: string;
  /** 해제사유발생일 */
  cdealDay?: string;
  /** 거래유형 — '중개거래' | '직거래' | '-' */
  dealingGbn?: string;
  /** 법정동명 */
  umdNm?: string;
  /** 시군구 코드 (응답에 포함되는 경우) */
  sggCd?: string | number;
  jibun?: string | number;
}

/** 정규화된 실거래 레코드 */
export interface ITransaction {
  /** 합성 식별자 — lawdCd:aptNm:dealDate:floor:area:amount */
  id: string;
  /** 시군구 코드 (조회 파라미터 기준) */
  lawdCd: string;
  aptNm: string;
  /** 거래금액 (만원) */
  dealAmount: number;
  /** 전용면적 (㎡) */
  excluUseAr: number;
  floor: number;
  buildYear: number | null;
  /** 계약일 (YYYY-MM-DD, 로컬) */
  dealDate: string;
  /** 계약 월 키 (YYYY-MM) */
  monthKey: string;
  tradeType: ETradeType;
  /** 해제된 거래 여부 (F-012 해제 뱃지) */
  isCanceled: boolean;
  /** 법정동명 */
  umdNm: string | null;
}

/** 월별 평균가 집계 (F-003 추이 차트 데이터 소스) */
export interface IMonthlyAverage {
  /** YYYY-MM */
  monthKey: string;
  /** 평균 거래금액 (만원) */
  averageAmount: number;
  /** 거래 건수 (해제 제외) */
  count: number;
}

/** 평형(면적 구간)별 집계 (F-004 평형 비교 데이터 소스) */
export interface IAreaGroupStat {
  /** 구간 대표 평수 (전용면적 환산 반올림) */
  pyeong: number;
  /** 표시 라벨 (예: "25평") */
  label: string;
  /** 구간 내 최소 전용면적 (㎡) */
  minArea: number;
  /** 구간 내 최대 전용면적 (㎡) */
  maxArea: number;
  /** 거래 건수 (해제 제외) */
  count: number;
  /** 평균 거래금액 (만원) */
  averageAmount: number;
  /** 최근 거래금액 (만원) */
  latestAmount: number;
  /** 최근 계약일 (YYYY-MM-DD) */
  latestDealDate: string;
}
