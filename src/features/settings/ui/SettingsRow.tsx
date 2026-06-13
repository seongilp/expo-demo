// 설정 행 공용 컴포넌트 (F-014) — 액션형(onPress+chevron/외부 링크)·정보형(우측 값/설명).
// 그룹(Card padding="none") 내에서 마지막 행을 제외하고 하단 보더로 구분.
import { View, Pressable } from 'react-native';
import { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/ui';
import { useThemeTokens } from '@/shared/lib';

type TSettingsRowAccessory = 'none' | 'chevron' | 'external';

interface ISettingsRowProps {
  label: string;
  /** 라벨 아래 보조 설명 (정보형 — 예: 데이터 출처 전문) */
  description?: string;
  /** 우측 슬롯 (SegmentedControl, 버전 텍스트 등) */
  right?: ReactNode;
  onPress?: () => void;
  accessory?: TSettingsRowAccessory;
  /** 그룹 내 마지막 행 — 하단 보더 생략 */
  isLast?: boolean;
}

export function SettingsRow({
  label,
  description,
  right,
  onPress,
  accessory = 'none',
  isLast = false,
}: ISettingsRowProps): React.JSX.Element {
  const { tokens } = useThemeTokens();
  const borderClass = isLast ? '' : 'border-b border-line dark:border-line-dark';

  const content = (
    <View className={`min-h-13 flex-row items-center justify-between px-4 py-3 ${borderClass}`}>
      <View className="flex-1 pr-3">
        <AppText variant="body">{label}</AppText>
        {description ? (
          <AppText variant="caption" className="mt-1 leading-4">
            {description}
          </AppText>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
      {accessory === 'chevron' ? (
        <Ionicons name="chevron-forward" size={16} color={tokens.textTertiary} />
      ) : null}
      {accessory === 'external' ? (
        <Ionicons name="open-outline" size={16} color={tokens.textTertiary} />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="active:opacity-85"
    >
      {content}
    </Pressable>
  );
}
