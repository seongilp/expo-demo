// RNFB v24 modular API 어댑터 — Analytics + Crashlytics.
// 이 파일은 client.ts가 lazy require 한다. 네이티브 모듈 부재/Firebase 미설정
// 환경에서는 모듈 평가(getApp) 시점에 throw → client가 noop으로 fallback.
// **직접 import 금지** — 외부 코드는 `@/shared/analytics` 래퍼만 사용한다.
import { getApp } from '@react-native-firebase/app';
import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  logScreenView as firebaseLogScreenView,
  setAnalyticsCollectionEnabled,
  setUserProperty as firebaseSetUserProperty,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  recordError,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';
import type { IAnalyticsAdapter } from './types';

const analytics = getAnalytics(getApp());
const crashlytics = getCrashlytics();

export const firebaseAdapter: IAnalyticsAdapter = {
  async setCollectionEnabled(enabled) {
    await setAnalyticsCollectionEnabled(analytics, enabled);
    await setCrashlyticsCollectionEnabled(crashlytics, enabled);
  },
  logEvent(name, params) {
    void firebaseLogEvent(analytics, name, params);
  },
  logScreenView(screenName) {
    void firebaseLogScreenView(analytics, {
      screen_name: screenName,
      screen_class: screenName,
    });
  },
  setUserProperty(key, value) {
    void firebaseSetUserProperty(analytics, key, value);
  },
  recordNonFatal(error) {
    recordError(crashlytics, error);
  },
};
