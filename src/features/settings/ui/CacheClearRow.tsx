// 캐시 초기화 행 (F-014) — 확인 Alert → clearQueryCache → 완료/실패 토스트.
// 관심 단지/최근 검색/테마는 별도 store — 절대 삭제되지 않는다 (안내 문구 포함).
import { useState } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { EVENTS, logEvent } from '@/shared/analytics';
import { clearQueryCache } from '../lib';
import { SettingsRow } from './SettingsRow';

interface ICacheClearRowProps {
  isLast?: boolean;
}

export function CacheClearRow({ isLast = false }: ICacheClearRowProps): React.JSX.Element {
  const [isClearing, setIsClearing] = useState(false);

  const runClear = async (): Promise<void> => {
    setIsClearing(true);
    try {
      await clearQueryCache();
      logEvent(EVENTS.CLEAR_QUERY_CACHE); // 성공 시에만 — 에러 경로 발화 금지
      Toast.show({
        type: 'success',
        text1: '조회 캐시를 정리했어요',
        text2: '관심 단지와 최근 검색은 그대로 유지돼요',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: '캐시 초기화에 실패했어요',
        text2: '잠시 후 다시 시도해 주세요',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const confirmClear = (): void => {
    if (isClearing) return;
    Alert.alert(
      '캐시 초기화',
      '저장된 실거래 조회 데이터를 삭제할까요?\n관심 단지와 최근 검색은 유지돼요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: () => {
            void runClear();
          },
        },
      ],
    );
  };

  return (
    <SettingsRow
      label="캐시 초기화"
      description="실거래 조회 데이터만 삭제돼요 (관심 단지는 유지)"
      onPress={confirmClear}
      accessory="chevron"
      isLast={isLast}
    />
  );
}
