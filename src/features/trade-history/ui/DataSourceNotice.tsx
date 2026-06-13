// 데이터 출처 고지 (F-012) — 국토교통부 실거래 신고 기준 + 신고 지연(최대 30일) 안내.
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/ui';
import { useThemeTokens } from '@/shared/lib';

export const DATA_SOURCE_NOTICE_TEXT =
  '국토교통부 실거래 신고 기준 · 최근 거래는 신고 지연(최대 30일)으로 누락될 수 있어요';

interface IDataSourceNoticeProps {
  className?: string;
}

export function DataSourceNotice({ className }: IDataSourceNoticeProps): React.JSX.Element {
  const { tokens } = useThemeTokens();

  return (
    <View
      className={`flex-row items-start rounded-lg bg-raised px-3 py-2.5 dark:bg-raised-dark ${className ?? ''}`}
    >
      <Ionicons name="information-circle-outline" size={14} color={tokens.textTertiary} />
      <AppText variant="micro" tone="sub" className="ml-1.5 flex-1 leading-4">
        {DATA_SOURCE_NOTICE_TEXT}
      </AppText>
    </View>
  );
}
