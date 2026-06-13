// push 스크린 커스텀 헤더 — 뒤로가기(44px) + 타이틀(+서브) + 우측 액션 슬롯
// (screen-layouts.md §0). Safe Area top은 Screen 컴포넌트가 처리.
import { View, Pressable } from 'react-native';
import { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useThemeTokens } from '@/shared/lib/hooks/useThemeTokens';
import { AppText } from './Typography';

interface IScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  /** 우측 액션 슬롯 (예: FavoriteStarButton) */
  right?: ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: IScreenHeaderProps): React.JSX.Element {
  const { tokens } = useThemeTokens();

  return (
    <View className="h-12 flex-row items-center px-2">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        className="h-11 w-11 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={24} color={tokens.textPrimary} />
      </Pressable>
      <View className="flex-1 px-1">
        <AppText variant="h3" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="micro" tone="faint" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? <View className="mr-1">{right}</View> : <View className="w-11" />}
    </View>
  );
}
