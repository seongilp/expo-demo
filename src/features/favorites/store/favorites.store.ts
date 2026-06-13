// 관심 단지 store — Zustand persist (AsyncStorage, 비민감 데이터). 상한 20 (F-005).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TAptKey } from '@/entities/apartment';
import type { IFavoriteApartment, TAddFavoriteResult } from '../types';

export const FAVORITES_LIMIT = 20;

interface IFavoritesState {
  favorites: IFavoriteApartment[];
  /** 등록 — 상한 초과/중복 시 거부하고 사유 반환 */
  addFavorite: (item: Omit<IFavoriteApartment, 'addedAt'>) => TAddFavoriteResult;
  /** 해제 */
  removeFavorite: (aptKey: TAptKey) => void;
  isFavorite: (aptKey: TAptKey) => boolean;
}

export const useFavoritesStore = create<IFavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (item) => {
        const { favorites } = get();
        if (favorites.some((favorite) => favorite.aptKey === item.aptKey)) {
          return { ok: false, reason: 'already_exists' };
        }
        if (favorites.length >= FAVORITES_LIMIT) {
          return { ok: false, reason: 'limit_exceeded' };
        }

        const next: IFavoriteApartment = {
          ...item,
          addedAt: new Date().toISOString(),
        };
        set({ favorites: [next, ...favorites] });
        return { ok: true };
      },

      removeFavorite: (aptKey) =>
        set((state) => ({
          favorites: state.favorites.filter((favorite) => favorite.aptKey !== aptKey),
        })),

      isFavorite: (aptKey) => get().favorites.some((favorite) => favorite.aptKey === aptKey),
    }),
    {
      name: 'favorites-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
