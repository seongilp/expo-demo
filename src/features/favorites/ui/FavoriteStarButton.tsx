// ★ 관심 단지 토글 버튼 (F-005) — 44×44 터치, scale spring + 햅틱(훅 내장).
// 토글/상한 안내/햅틱은 useFavoriteToggle이 담당 — 이 컴포넌트는 표시·애니메이션만.
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useThemeTokens } from '@/shared/lib';
import type { IFavoriteApartment } from '../types';
import { useFavoriteToggle } from '../hooks';

interface IFavoriteStarButtonProps {
  apartment: Omit<IFavoriteApartment, 'addedAt'>;
  /** 아이콘 크기 (기본 24) */
  size?: number;
}

export function FavoriteStarButton({
  apartment,
  size = 24,
}: IFavoriteStarButtonProps): React.JSX.Element {
  const { tokens } = useThemeTokens();
  const { isFavorite, toggle } = useFavoriteToggle();
  const scale = useSharedValue(1);

  const active = isFavorite(apartment.aptKey);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPress = (): void => {
    scale.value = withSequence(
      withSpring(1.25, { damping: 12, stiffness: 300 }),
      withSpring(1, { damping: 14, stiffness: 260 }),
    );
    toggle(apartment);
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={active ? '관심 단지 해제' : '관심 단지 등록'}
      accessibilityState={{ selected: active }}
      className="h-11 w-11 items-center justify-center"
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={active ? 'star' : 'star-outline'}
          size={size}
          color={active ? tokens.chartLine : tokens.textTertiary}
        />
      </Animated.View>
    </Pressable>
  );
}
