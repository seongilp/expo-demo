import type { TLawdCd } from '@/entities/region';
import type { TAptKey } from '@/entities/apartment';

/** 관심 단지 — 로컬 persist 저장 단위 (비민감) */
export interface IFavoriteApartment {
  aptKey: TAptKey;
  aptNm: string;
  lawdCd: TLawdCd;
  /** 소속 시군구 표기 (예: "서울특별시 강남구") */
  regionName: string;
  /** 등록 시각 (ISO 타임스탬프) */
  addedAt: string;
}

/** 등록 거부 사유 */
export type TAddFavoriteFailureReason = 'limit_exceeded' | 'already_exists';

/** 등록 결과 — 상한(20) 초과 시 거부 + 사유 반환 */
export type TAddFavoriteResult =
  | { ok: true }
  | { ok: false; reason: TAddFavoriteFailureReason };

/** 토글 결과 ([4b] useFavoriteToggle 계약) */
export type TFavoriteToggleResult =
  | { action: 'added' }
  | { action: 'removed' }
  | { action: 'rejected'; reason: TAddFavoriteFailureReason };

/** 관심 단지의 최신 거래 요약 (홈 카드 표기용 — 해제 거래 제외) */
export interface ILatestTradeSummary {
  /** 거래금액 (만원) */
  dealAmount: number;
  /** 전용면적 (㎡) */
  excluUseAr: number;
  /** 계약일 (YYYY-MM-DD) */
  dealDate: string;
  floor: number;
}

/** 관심 단지별 요약 ([4b] useFavoriteSummaries 계약) */
export interface IFavoriteSummary {
  aptKey: TAptKey;
  /** 최근 3개월 내 거래 없으면 null */
  latest: ILatestTradeSummary | null;
}
