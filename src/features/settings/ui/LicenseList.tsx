// 오픈소스 라이선스 목록 (US-502) — 주요 의존성 + SPDX 라이선스 정적 렌더.
import { ScrollView, View } from 'react-native';
import { AppText, Card } from '@/shared/ui';
import { OPEN_SOURCE_LICENSES } from '../lib';

export function LicenseList(): React.JSX.Element {
  return (
    <ScrollView
      className="px-5"
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <AppText variant="caption" tone="sub" className="mt-2 px-1 leading-5">
        이 앱은 아래 오픈소스 라이브러리를 사용합니다. 각 라이브러리는 해당 라이선스를 따릅니다.
      </AppText>

      <Card padding="none" className="mt-3">
        {OPEN_SOURCE_LICENSES.map((item, index) => (
          <View
            key={item.name}
            className={`min-h-12 flex-row items-center justify-between px-4 py-3 ${
              index === OPEN_SOURCE_LICENSES.length - 1
                ? ''
                : 'border-b border-line dark:border-line-dark'
            }`}
          >
            <AppText variant="body" className="flex-1 pr-3">
              {item.name}
            </AppText>
            <AppText variant="caption" tone="faint">
              {item.license}
            </AppText>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
