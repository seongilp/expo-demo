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
import { initializeAdsWithConsent } from '@/features/ads';
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
        // 이후 ads consent 시퀀스가 기록하는 user property가 유실되지 않는다.
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
      // Ads consent 시퀀스(UMP → ATT → initialize)는 콜드 스타트를 막지 않도록
      // fire-and-forget. 내부에 타임아웃 가드가 있어 네트워크 지연 시에도 ready 처리된다.
      // (consent 모듈이 idempotent + 모든 단계 try/catch 보호)
      void initializeAdsWithConsent();
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
