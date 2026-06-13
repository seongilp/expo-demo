// 화면 진입 시 screen_view 자동 수집 — 모든 스크린(app/*)에서 호출 (F-011).
// useFocusEffect 기반 — 탭 전환/뒤로가기 재진입도 화면 조회로 집계된다.
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { logScreenView } from '../client';

export const useScreenTracking = (screenName: string): void => {
  useFocusEffect(
    useCallback(() => {
      logScreenView(screenName);
    }, [screenName]),
  );
};
