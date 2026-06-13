import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { QueryProvider, ThemeProvider } from '@core/providers';
import { toastConfig, ErrorBoundary } from '@/shared/ui';
import { lightTokens, darkTokens } from '@/shared/config';
import { initAnalytics, recordFirstOpenAt } from '@/shared/analytics';
import '../global.css';

export default function RootLayout(): React.JSX.Element {
  const [isInitialized, setIsInitialized] = useState(false);
  // 초기 로딩 화면은 ThemeProvider 마운트 전이므로 시스템 컬러 스킴을 직접 따른다.
  // (lightTokens 고정 시 다크 모드 기기에서 라이트 플래시 발생)
  const colorScheme = useColorScheme();
  const tokens = colorScheme === 'dark' ? darkTokens : lightTokens;

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        // Analytics first — collection toggle (IS_PROD) + Crashlytics 활성화.
        await initAnalytics();
        await recordFirstOpenAt();
      } catch (error) {
        if (__DEV__) {
          console.warn('Failed to initialize analytics:', error);
        }
      } finally {
        // Analytics 준비 직후 앱 진입을 막지 않는다.
        setIsInitialized(true);
      }
    };
    void initialize();
  }, []);

  if (!isInitialized) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: tokens.background },
        ]}
      >
        <ActivityIndicator size="large" color={tokens.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <QueryProvider>
            <ThemeProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="licenses" />
              </Stack>
              <Toast config={toastConfig} />
            </ThemeProvider>
          </QueryProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
});
