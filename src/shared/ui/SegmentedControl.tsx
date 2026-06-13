// 세그먼트 토글 — 차트 기간(12/24개월), 테마 3-way 공용 (nativewind-theme.md §4.6).
// 활성 인디케이터는 Reanimated spring 이동, 전환 시 selection 햅틱.
// Animated.View는 NativeWind 미등록 — 인디케이터는 useThemeTokens 기반 style로 처리.
import { useEffect, useState } from 'react';
import { View, Pressable, LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { haptics } from '@/shared/lib/haptics';
import { useThemeTokens } from '@/shared/lib/hooks/useThemeTokens';
import { AppText } from './Typography';

export interface ISegmentedControlOption<T extends string | number> {
  label: string;
  value: T;
}

interface ISegmentedControlProps<T extends string | number> {
  options: ISegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const TRACK_PADDING = 2; // p-0.5

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className,
}: ISegmentedControlProps<T>): React.JSX.Element {
  const { tokens, isDark } = useThemeTokens();
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);

  const segmentWidth =
    options.length > 0 ? Math.max(0, trackWidth - TRACK_PADDING * 2) / options.length : 0;
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  useEffect(() => {
    translateX.value = withSpring(activeIndex * segmentWidth, {
      damping: 20,
      stiffness: 250,
    });
  }, [activeIndex, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onTrackLayout = (event: LayoutChangeEvent): void => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const select = (next: T): void => {
    if (next === value) return;
    haptics.selection();
    onChange(next);
  };

  return (
    <View
      onLayout={onTrackLayout}
      className={`h-9 flex-row rounded-lg bg-field p-0.5 dark:bg-field-dark ${className ?? ''}`}
      accessibilityRole="tablist"
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            indicatorStyle,
            {
              width: segmentWidth,
              backgroundColor: isDark ? tokens.surfaceRaised : tokens.surface,
            },
          ]}
        />
      ) : null}
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => select(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isActive }}
            className="flex-1 items-center justify-center"
          >
            <AppText
              variant="caption"
              tone={isActive ? 'default' : 'sub'}
              className={isActive ? 'font-semibold' : ''}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

// shadow-card 토큰과 동일 값 (tailwind boxShadow.card: 0 2px 8px rgba(31,27,22,0.06))
const SHADOW_CARD_COLOR = '#1F1B16';

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: TRACK_PADDING,
    borderRadius: 6,
    shadowColor: SHADOW_CARD_COLOR,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
