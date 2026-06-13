// 버튼 프리미티브 — 시안 B (nativewind-theme.md §4.1).
// Variants: primary/secondary/outline/ghost/danger, Sizes: sm(h-9)/md(h-11)/lg(h-13).
// dark: 페어와 pressed 색은 이 컴포넌트 내부에 캡슐화.
import { Pressable, Text, ActivityIndicator, View, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { useThemeTokens } from '@/shared/lib/hooks/useThemeTokens';

type TButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type TButtonSize = 'sm' | 'md' | 'lg';

interface IButtonProps {
  title: string;
  onPress: () => void;
  variant?: TButtonVariant;
  size?: TButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** 라벨 좌측 아이콘 슬롯 (예: 위치 아이콘) */
  icon?: ReactNode;
  accessibilityLabel?: string;
  className?: string;
  style?: ViewStyle;
}

const CONTAINER_CLASS: Record<TButtonVariant, string> = {
  primary:
    'bg-primary-600 active:bg-primary-700 dark:bg-primary-400 dark:active:bg-primary-300',
  secondary: 'bg-raised active:opacity-85 dark:bg-raised-dark',
  outline:
    'border border-line-strong bg-transparent active:opacity-85 dark:border-line-strong-dark',
  ghost: 'bg-transparent active:opacity-70',
  danger: 'bg-danger-soft active:opacity-85 dark:bg-danger-soft-dark',
};

const LABEL_CLASS: Record<TButtonVariant, string> = {
  primary: 'text-inverse dark:text-inverse-dark',
  secondary: 'text-ink dark:text-ink-dark',
  outline: 'text-ink dark:text-ink-dark',
  ghost: 'text-primary-600 dark:text-primary-400',
  danger: 'text-danger dark:text-danger-dark',
};

const SIZE_CLASS: Record<TButtonSize, string> = {
  sm: 'h-9 px-3',
  md: 'h-11 px-4',
  lg: 'h-13 px-6',
};

const LABEL_SIZE_CLASS: Record<TButtonSize, string> = {
  sm: 'text-caption',
  md: 'text-body',
  lg: 'text-body',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  accessibilityLabel,
  className,
  style,
}: IButtonProps): React.JSX.Element {
  const { tokens } = useThemeTokens();
  const isDisabled = disabled || loading;
  const spinnerColor = variant === 'primary' ? tokens.textInverse : tokens.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={style}
      className={`flex-row items-center justify-center rounded-xl ${CONTAINER_CLASS[variant]} ${SIZE_CLASS[size]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-40' : ''} ${className ?? ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {icon ? <View className="mr-1.5">{icon}</View> : null}
          <Text className={`font-semibold ${LABEL_SIZE_CLASS[size]} ${LABEL_CLASS[variant]}`}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
