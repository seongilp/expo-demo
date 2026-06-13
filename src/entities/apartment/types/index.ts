// 허용 예외: entities/apartment → entities/region (단지가 법정동에 종속 — fsd-module-map §4)
import type { TLawdCd } from '@/entities/region';

/** 단지 식별 키 — `{lawdCd}:{aptNm}` 합성 (실거래 API에 단지 고유 ID가 없음) */
export type TAptKey = string;

/** 아파트 단지 */
export interface IApartment {
  aptKey: TAptKey;
  lawdCd: TLawdCd;
  /** 단지명 (국토부 실거래 응답 aptNm 기준) */
  aptNm: string;
  /** 준공년도 — 번들/응답에 없으면 null */
  builtYear: number | null;
}
