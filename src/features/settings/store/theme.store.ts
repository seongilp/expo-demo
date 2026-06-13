// 테마 모드 store — system/light/dark 3-way, Zustand persist (AsyncStorage, 비민감).
// NativeWind colorScheme.set()으로 즉시 반영 + 앱 시작 시 rehydrate 복원 (design §2).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import { EThemeMode, TThemeMode } from '../types';

interface IThemeState {
  mode: TThemeMode;
  setMode: (mode: TThemeMode) => void;
}

export const useThemeStore = create<IThemeState>()(
  persist(
    (set) => ({
      mode: EThemeMode.SYSTEM,

      setMode: (mode) => {
        colorScheme.set(mode); // NativeWind에 즉시 반영
        set({ mode });
      },
    }),
    {
      name: 'theme-store', // 비민감 — AsyncStorage 허용
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) colorScheme.set(state.mode); // 앱 시작 시 복원
      },
    },
  ),
);
