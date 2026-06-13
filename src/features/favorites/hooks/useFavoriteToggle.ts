// 관심 단지 등록/해제 토글 (F-005) — 햅틱 피드백 + 상한(20) 초과 안내.
// 안내는 비차단 토스트 — 사용자 흐름을 막지 않는다.
import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { haptics } from '@/shared/lib';
import { EVENTS, logEvent, setFavoriteBucketProperty } from '@/shared/analytics';
import type { IFavoriteApartment, TFavoriteToggleResult } from '../types';
import { useFavoritesStore, FAVORITES_LIMIT } from '../store';

export interface IUseFavoriteToggleResult {
  /** 현재 등록 여부 — 별 버튼 상태 표시용 */
  isFavorite: (aptKey: string) => boolean;
  /** 등록↔해제 토글 — 결과(added/removed/rejected)를 반환 (후속 UI 분기는 호출자 선택) */
  toggle: (item: Omit<IFavoriteApartment, 'addedAt'>) => TFavoriteToggleResult;
}

export const useFavoriteToggle = (): IUseFavoriteToggleResult => {
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  const toggle = useCallback(
    (item: Omit<IFavoriteApartment, 'addedAt'>): TFavoriteToggleResult => {
      if (isFavorite(item.aptKey)) {
        removeFavorite(item.aptKey);
        haptics.impactLight();
        const removedCount = useFavoritesStore.getState().favorites.length;
        logEvent(EVENTS.REMOVE_FAVORITE_APARTMENT, {
          lawd_cd: item.lawdCd,
          favorite_count: removedCount,
        });
        setFavoriteBucketProperty(removedCount);
        return { action: 'removed' };
      }

      const result = addFavorite(item);
      if (result.ok) {
        haptics.impactMedium();
        const addedCount = useFavoritesStore.getState().favorites.length;
        logEvent(EVENTS.ADD_FAVORITE_APARTMENT, {
          lawd_cd: item.lawdCd,
          favorite_count: addedCount,
        });
        setFavoriteBucketProperty(addedCount);
        return { action: 'added' };
      }

      haptics.warning();
      if (result.reason === 'limit_exceeded') {
        Toast.show({
          type: 'info',
          text1: `관심 단지는 최대 ${FAVORITES_LIMIT}개까지 저장할 수 있어요`,
          text2: '기존 관심 단지를 해제한 뒤 다시 시도해 주세요',
        });
      }
      return { action: 'rejected', reason: result.reason };
    },
    [isFavorite, addFavorite, removeFavorite],
  );

  return { isFavorite, toggle };
};
