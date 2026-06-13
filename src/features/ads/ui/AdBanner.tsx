// Adaptive Banner (F-010) — 단지 상세/지역 리스트 하단 anchored 전용 (화면당 1개).
// 무효 트래픽 방어: 클릭 가드(useAdGuardStore) 경유 + 로드 실패 지수 백오프.
// 미로드/실패 시 높이 0 collapse — placeholder 빈 박스를 그리지 않는다 (정지 사유 방어).
import { useEffect, useRef, useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import dayjs from 'dayjs';
import { ADS_CONFIG } from '@/shared/config';
import { useAdGuardStore } from '../store';

interface IAdBannerProps {
  unitId: string;
  /**
   * 배너 영역 총 높이(배너 + safe bottom inset) 변경 통지 —
   * 스크롤 콘텐츠 contentContainerStyle paddingBottom 보정용 (콘텐츠 가림 0).
   */
  onHeightChange?: (height: number) => void;
}

export function AdBanner({ unitId, onHeightChange }: IAdBannerProps): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  const [isLoaded, setIsLoaded] = useState(false);
  const bannerRef = useRef<BannerAd>(null);
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onHeightChangeRef = useRef(onHeightChange);
  onHeightChangeRef.current = onHeightChange;

  // 클릭 가드 — suppressedUntil 구독으로 발동 시 리렌더.
  // 렌더 중 store 함수(isBannerSuppressed) 호출은 만료 정리 set()을 유발하므로
  // 동일 정책을 순수 계산으로 평가한다 (만료된 값은 무해 — 다음 클릭 기록 시 정리).
  const suppressedUntil = useAdGuardStore((state) => state.suppressedUntil);
  const recordBannerClick = useAdGuardStore((state) => state.recordBannerClick);
  const suppressed = suppressedUntil !== null && dayjs().isBefore(dayjs(suppressedUntil));

  // 언마운트/숨김 시 재시도 타이머 정리 + 패딩 보정 해제
  useEffect(
    () => () => {
      if (retryTimerRef.current !== null) clearTimeout(retryTimerRef.current);
      onHeightChangeRef.current?.(0);
    },
    [],
  );

  useEffect(() => {
    if (suppressed) onHeightChangeRef.current?.(0);
  }, [suppressed]);

  if (suppressed) return null;

  const onAdLoaded = (): void => {
    retryAttemptRef.current = 0;
    setIsLoaded(true);
  };

  const onAdFailedToLoad = (): void => {
    setIsLoaded(false);
    onHeightChangeRef.current?.(0);
    if (retryAttemptRef.current >= ADS_CONFIG.BANNER_RETRY_MAX_ATTEMPTS) return;

    // 지수 백오프: 2s → 4s → 8s (즉시 무한 재시도 금지 — Hard Threshold)
    const delayMs = ADS_CONFIG.BANNER_RETRY_BASE_DELAY_MS * 2 ** retryAttemptRef.current;
    retryAttemptRef.current += 1;
    retryTimerRef.current = setTimeout(() => {
      bannerRef.current?.load();
    }, delayMs);
  };

  const onAdClicked = (): void => {
    recordBannerClick();
  };

  const onContainerLayout = (event: LayoutChangeEvent): void => {
    onHeightChangeRef.current?.(event.nativeEvent.layout.height);
  };

  return (
    <View
      onLayout={onContainerLayout}
      // 미로드 시 collapse(높이 0, overflow 숨김) — 로드되면 자연 높이로 expand
      style={isLoaded ? { paddingBottom: insets.bottom } : { height: 0, overflow: 'hidden' }}
      className={
        isLoaded
          ? 'items-center border-t border-line bg-surface dark:border-line-dark dark:bg-surface-dark'
          : undefined
      }
      accessibilityLabel="광고 배너"
    >
      <BannerAd
        ref={bannerRef}
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={onAdLoaded}
        onAdFailedToLoad={onAdFailedToLoad}
        onAdClicked={onAdClicked}
      />
    </View>
  );
}
