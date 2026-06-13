// 테마 컨테이너 (F-009) — theme.store의 3-way 모드(system/light/dark)를
// NativeWind colorScheme에 동기화하고, StatusBar를 해석된 스킴에 연동한다.
// system 모드는 NativeWind가 OS 스킴을 따르므로 useThemeTokens가 즉시 반응한다.
import React, { ReactNode, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import { useThemeTokens } from '@/shared/lib';
import { useThemeStore } from '@/features/settings';

interface IThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: IThemeProviderProps): React.JSX.Element {
  const mode = useThemeStore((state) => state.mode);
  const { tokens, isDark } = useThemeTokens();

  // persist rehydrate 이전 마운트 시점에도 현재 모드를 보장 적용 (전 화면 즉시 반응)
  useEffect(() => {
    colorScheme.set(mode);
  }, [mode]);

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
