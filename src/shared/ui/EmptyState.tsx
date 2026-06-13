// 빈 상태 프리미티브 — 기본 아이콘 세트 (spec empty_state_illustration=default,
// nativewind-theme.md §4.8). 빈/에러 상태 문구는 화면별 카탈로그를 따른다.
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeTokens } from '@/shared/lib/hooks/useThemeTokens';
import { AppText } from './Typography';
import { Button } from './Button';

type TIoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface IEmptyStateAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
}

interface IEmptyStateProps {
  icon?: TIoniconName;
  title: string;
  description?: string;
  action?: IEmptyStateAction;
  /** 자동완성 무결과 등 좁은 영역용 컴팩트 패딩 */
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon = 'document-text-outline',
  title,
  description,
  action,
  compact = false,
  className,
}: IEmptyStateProps): React.JSX.Element {
  const { tokens } = useThemeTokens();

  return (
    <View
      className={`items-center justify-center px-8 ${compact ? 'py-8' : 'py-12'} ${className ?? ''}`}
    >
      <Ionicons name={icon} size={48} color={tokens.textTertiary} />
      <AppText variant="h3" className="mt-4 text-center">
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" className="mt-1.5 text-center">
          {description}
        </AppText>
      ) : null}
      {action ? (
        <Button
          title={action.label}
          onPress={action.onPress}
          variant={action.variant ?? 'primary'}
          size="md"
          className="mt-5"
        />
      ) : null}
    </View>
  );
}
