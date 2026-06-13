// 로딩 스켈레톤 — opacity pulse 1.2s loop (nativewind-theme.md §4.7).
// 프리셋은 실제 콘텐츠 골격을 미러링 — 로드 후 레이아웃 시프트 0 원칙.
// Animated.View는 NativeWind 미등록 컴포넌트라 크기/모양은 외곽 View className,
// 펄스 색/투명도는 useThemeTokens 기반 style로 처리한다.
import { useEffect } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useThemeTokens } from '@/shared/lib/hooks/useThemeTokens';

const PULSE_DURATION_MS = 600; // 0.5↔1.0 왕복 1.2s

interface ISkeletonProps {
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({ className, style }: ISkeletonProps): React.JSX.Element {
  const { tokens } = useThemeTokens();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.5, { duration: PULSE_DURATION_MS }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={style} className={`overflow-hidden rounded-md ${className ?? ''}`}>
      <Animated.View
        style={[styles.fill, animatedStyle, { backgroundColor: tokens.skeleton }]}
      />
    </View>
  );
}

/** 본문 1줄 골격 */
export function SkeletonText({ className }: ISkeletonProps): React.JSX.Element {
  return <Skeleton className={`h-4 w-32 ${className ?? ''}`} />;
}

/** 가격 헤드라인 골격 (SkeletonPrice) */
export function SkeletonPrice({ className }: ISkeletonProps): React.JSX.Element {
  return <Skeleton className={`h-6 w-24 ${className ?? ''}`} />;
}

/** 차트 카드 골격 */
export function SkeletonChart({ className }: ISkeletonProps): React.JSX.Element {
  return <Skeleton className={`h-44 w-full rounded-2xl ${className ?? ''}`} />;
}

/** 리스트 행 골격 — TransactionItem/RegionAptListItem 레이아웃 미러 */
export function SkeletonListItem({ className }: ISkeletonProps): React.JSX.Element {
  return (
    <View
      className={`min-h-16 flex-row items-center border-b border-line px-5 py-3 dark:border-line-dark ${className ?? ''}`}
    >
      <View className="flex-1">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-2 h-3 w-20" />
      </View>
      <View className="items-end">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-2 h-3 w-14" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
