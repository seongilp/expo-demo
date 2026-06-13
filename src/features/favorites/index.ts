// features/favorites — 관심 단지 저장 (F-005, 상한 20, 로컬 persist)
export type {
  IFavoriteApartment,
  TAddFavoriteResult,
  TAddFavoriteFailureReason,
  TFavoriteToggleResult,
  ILatestTradeSummary,
  IFavoriteSummary,
} from './types';
export { useFavoritesStore, FAVORITES_LIMIT } from './store';
export { useFavoriteToggle, useFavoriteSummaries } from './hooks';
export type { IUseFavoriteToggleResult, IUseFavoriteSummariesResult } from './hooks';
export { FavoriteStarButton } from './ui';
