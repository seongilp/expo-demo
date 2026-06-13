import { ExpoConfig, ConfigContext } from 'expo/config';

// ATT(추적 권한) 문구 — infoPlist / react-native-google-mobile-ads plugin /
// expo-tracking-transparency plugin 3곳에 반드시 동일하게 사용 (CLAUDE.md MANDATORY)
const TRACKING_USAGE_DESCRIPTION =
  '맞춤형 광고 제공을 위해 광고 식별자를 사용합니다.';

// 위치 권한 문구 — "내 주변 시세"(F-007). 거부해도 전 기능 사용 가능 (optional)
const LOCATION_USAGE_DESCRIPTION =
  '내 주변 아파트 시세를 보여드리기 위해 현재 위치를 사용합니다. 위치는 시군구 확인 즉시 폐기되며 저장되지 않습니다.';

export default ({ config }: ConfigContext): ExpoConfig => {
  const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const DEBUG = process.env.DEBUG === 'true';
  const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
  const APP_VERSION = process.env.APP_VERSION || '1.0.0';

  return {
    ...config,
    name: '집값노트',
    slug: 'jipgapnote',
    version: APP_VERSION,
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    scheme: 'jipgapnote',
    icon: './assets/images/icon.png',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0a0a0a',
    },
    web: {
      bundler: 'metro',
      output: 'static',
    },
    ios: {
      supportsTablet: false,
      // RN Firebase + AdMob 호환성 (Expo issue #39607). 신규 앱은 jsc 유지 권장.
      jsEngine: 'jsc',
      bundleIdentifier: 'com.jipgapnote.app',
      googleServicesFile:
        process.env.GOOGLE_SERVICE_INFO_PLIST ??
        './firebase/GoogleService-Info.plist',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        // MOLIT 공공 API(apis.data.go.kr)는 HTTPS이므로 ATS 예외가 필요 없다.
        // NSAllowsArbitraryLoads 전면 해제는 App Store 심사 리스크 + 보안 위반.
        // Required for App Tracking Transparency (ATT) prompt on iOS 14.5+.
        NSUserTrackingUsageDescription: TRACKING_USAGE_DESCRIPTION,
        // "내 주변 시세" (F-007) — optional 권한, 거부해도 전 기능 사용 가능
        NSLocationWhenInUseUsageDescription: LOCATION_USAGE_DESCRIPTION,
      },
    },
    android: {
      package: 'com.jipgapnote.app',
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? './firebase/google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#0a0a0a',
      },
    },
    plugins: [
      // Google AdMob test app IDs — safe for development/simulator
      // Replace with real IDs from AdMob Console before production build
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: 'ca-app-pub-3940256099942544~3347511713',
          iosAppId: 'ca-app-pub-3940256099942544~1458002511',
          userTrackingUsageDescription: TRACKING_USAGE_DESCRIPTION,
        },
      ],
      // ATT prompt on iOS 14.5+ — required so AdMob can serve personalized ads.
      [
        'expo-tracking-transparency',
        {
          userTrackingPermission: TRACKING_USAGE_DESCRIPTION,
        },
      ],
      // "내 주변 시세" 위치 권한 (F-007) — iOS 문구 + Android 권한 자동 주입
      [
        'expo-location',
        {
          locationWhenInUsePermission: LOCATION_USAGE_DESCRIPTION,
          isAndroidBackgroundLocationEnabled: false,
        },
      ],
      // Firebase Analytics/Crashlytics — KPI 수집(F-011) + AdMob audience signal.
      // Without this, ads default to non-personalized (NPA) and eCPM drops 3-5x.
      // Place GoogleService-Info.plist + google-services.json in ./firebase/.
      // (콘솔 등록 절차: _workspace/implementation/firebase-manual.md)
      '@react-native-firebase/app',
      '@react-native-firebase/crashlytics',
      [
        'expo-build-properties',
        {
          ios: {
            // RN Firebase v24 + Expo SDK 54 + RN 0.81 호환성 (Expo issue #39607):
            // - useFrameworks: 'static' → AdMob(react-native-google-mobile-ads) 요구사항
            // - forceStaticLinking: RNFB pod들을 prebuilt React framework 대신
            //   static link 로 빌드 → "include of non-modular header inside
            //   framework module" 에러 해결
            // - GoogleUtilities modular_headers → AdMob과의 공유 pod 호환성
            useFrameworks: 'static',
            forceStaticLinking: ['RNFBApp', 'RNFBAnalytics', 'RNFBCrashlytics'],
            extraPods: [{ name: 'GoogleUtilities', modular_headers: true }],
          },
        },
      ],
      // RNFB + RN 0.81 + New Architecture + static frameworks 빌드 패치 (CLAUDE.md MANDATORY)
      './plugins/withRNFirebaseStaticBuild',
      'expo-router',
      // Localized app name — shown on home screen matching store listing
      // Add/remove languages as needed. Keys are locale codes.
      ['./plugins/withLocalizedAppName', {
        ko: '집값노트',
      }],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: false,
    },
    newArchEnabled: true,
    extra: {
      apiUrl: API_URL,
      nodeEnv: NODE_ENV,
      debug: DEBUG,
      logLevel: LOG_LEVEL,
      appVersion: APP_VERSION,
      router: {},
      eas: {
        projectId: '',
      },
    },
  };
};
