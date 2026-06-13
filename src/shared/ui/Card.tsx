// 카드 프리미티브 — 보더 우선 원칙 (design-system.md §4 / nativewind-theme.md §4.2).
// 그림자는 elevated variant의 shadow-card 1단계만 허용 (중첩 금지).
import { View, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

type TCardVariant = 'default' | 'elevated';

interface ICardProps {
  children: ReactNode;
  variant?: TCardVariant;
  /** 내부 패딩 — 설정 그룹처럼 행이 자체 패딩을 가질 때 'none' */
  padding?: 'default' | 'none';
  style?: ViewStyle;
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'default',
  style,
  className,
}: ICardProps): React.JSX.Element {
  const base =
    'bg-surface dark:bg-surface-dark rounded-2xl border border-line dark:border-line-dark';
  const elevation = variant === 'elevated' ? 'shadow-card' : '';
  const pad = padding === 'default' ? 'p-4' : '';

  return (
    <View style={style} className={`${base} ${elevation} ${pad} ${className ?? ''}`}>
      {children}
    </View>
  );
}
