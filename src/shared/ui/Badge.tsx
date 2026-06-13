// 뱃지 프리미티브 — canceled(거래해제)/new(신규)/direct(직거래)/neutral 4종
// (nativewind-theme.md §4.3). 높이 20, text-micro, dark: 페어 캡슐화.
import { View, Text } from 'react-native';

export type TBadgeVariant = 'canceled' | 'new' | 'direct' | 'neutral';

interface IBadgeProps {
  label: string;
  variant?: TBadgeVariant;
  className?: string;
}

const CONTAINER_CLASS: Record<TBadgeVariant, string> = {
  canceled: 'bg-danger-soft dark:bg-danger-soft-dark',
  new: 'bg-primary-50 dark:bg-primary-800',
  direct: 'bg-warning-soft dark:bg-warning-soft-dark',
  neutral: 'bg-raised dark:bg-raised-dark',
};

const LABEL_CLASS: Record<TBadgeVariant, string> = {
  canceled: 'text-danger dark:text-danger-dark',
  new: 'text-primary-600 dark:text-primary-300',
  direct: 'text-warning dark:text-warning-dark',
  neutral: 'text-sub dark:text-sub-dark',
};

export function Badge({ label, variant = 'neutral', className }: IBadgeProps): React.JSX.Element {
  return (
    <View
      className={`h-5 items-center justify-center rounded-md px-1.5 ${CONTAINER_CLASS[variant]} ${className ?? ''}`}
    >
      <Text className={`text-micro ${LABEL_CLASS[variant]}`}>{label}</Text>
    </View>
  );
}
