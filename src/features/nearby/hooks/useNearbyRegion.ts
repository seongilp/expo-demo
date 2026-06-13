// 내 주변 시세 (F-007) — 위치 권한 optional.
// 권한 요청은 최초 1회만(undetermined일 때), 거부해도 전 기능 사용 가능 — 재요청 반복 금지.
// 좌표는 시군구 코드 변환 직후 즉시 폐기 — 저장/전송/로깅 절대 금지 (lawd_cd 수준만 허용).
import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { EVENTS, logEvent } from '@/shared/analytics';
import { formatRegionName } from '@/entities/region';
import type { INearbyResolveResult } from '../types';
import { resolveRegionFromCoords } from '../lib';

export interface IUseNearbyRegionResult {
  /** 권한 확인 → 좌표 취득 → 시군구 변환. 실패해도 throw하지 않고 결과로 반환 */
  resolve: () => Promise<INearbyResolveResult>;
  isResolving: boolean;
}

const DENIED_RESULT: INearbyResolveResult = {
  permission: 'denied',
  lawdCd: null,
  regionName: null,
};

const showDeniedToast = (): void => {
  Toast.show({
    type: 'info',
    text1: '위치 권한 없이도 지역 검색으로 이용할 수 있어요',
    text2: '검색 탭에서 시군구를 직접 검색해 주세요',
  });
};

const showBlockedToast = (): void => {
  Toast.show({
    type: 'info',
    text1: '위치 권한이 꺼져 있어요',
    text2: '설정 > 앱 > 위치에서 허용하면 내 주변 시세를 볼 수 있어요',
  });
};

const showOutOfServiceToast = (): void => {
  Toast.show({
    type: 'info',
    text1: '주변 서비스 지역을 찾지 못했어요',
    text2: '지역 검색으로 시군구를 직접 선택해 주세요',
  });
};

const requestPermissionOnce = async (): Promise<Location.LocationPermissionResponse> => {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.status === Location.PermissionStatus.UNDETERMINED && current.canAskAgain) {
    return Location.requestForegroundPermissionsAsync();
  }
  return current;
};

export const useNearbyRegion = (): IUseNearbyRegionResult => {
  const [isResolving, setIsResolving] = useState(false);

  const resolve = useCallback(async (): Promise<INearbyResolveResult> => {
    setIsResolving(true);
    try {
      const permission = await requestPermissionOnce();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        const isBlocked = !permission.canAskAgain;
        if (isBlocked) showBlockedToast();
        else showDeniedToast();
        // 권한 거부 — lawd_cd 없이 결과만 수집 (좌표/주소 전송 금지)
        logEvent(EVENTS.USE_NEARBY_SEARCH, {
          permission_result: isBlocked ? 'blocked' : 'denied',
        });
        return { ...DENIED_RESULT, permission: isBlocked ? 'blocked' : 'denied' };
      }

      // 시군구 단위 정밀도면 충분 — 저전력/빠른 응답 우선
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      const region = resolveRegionFromCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      // 좌표는 위 변환으로 소비 완료 — 이후 어디에도 보관/전달하지 않는다

      if (!region) {
        showOutOfServiceToast();
        logEvent(EVENTS.USE_NEARBY_SEARCH, { permission_result: 'granted' });
        return { permission: 'granted', lawdCd: null, regionName: null };
      }

      // granted 시에만 lawd_cd(시군구 5자리) 수집 — 좌표는 이미 폐기됨
      logEvent(EVENTS.USE_NEARBY_SEARCH, {
        permission_result: 'granted',
        lawd_cd: region.lawdCd,
      });
      return {
        permission: 'granted',
        lawdCd: region.lawdCd,
        regionName: formatRegionName(region),
      };
    } catch {
      // 위치 취득 실패 (GPS 꺼짐 등) — 비차단 안내 후 지역 검색 fallback
      Toast.show({
        type: 'error',
        text1: '현재 위치를 가져오지 못했어요',
        text2: '잠시 후 다시 시도하거나 지역 검색을 이용해 주세요',
      });
      return { permission: 'granted', lawdCd: null, regionName: null };
    } finally {
      setIsResolving(false);
    }
  }, []);

  return { resolve, isResolving };
};
