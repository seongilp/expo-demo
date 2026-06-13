// 설정 — 테마/데이터/정보 (F-009/F-014, screen-layouts.md §3).
// 광고 배치 금지 화면. 전부 로컬 — 네트워크 로딩/에러 상태 없음.
import { ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, AppText, Card } from '@/shared/ui';
import { env } from '@/shared/config';
import { useScreenTracking } from '@/shared/analytics';
import { SettingsRow, ThemeSelector, CacheClearRow } from '@/features/settings';
import { DATA_SOURCE_NOTICE_TEXT } from '@/features/trade-history';

// 개인정보처리방침 — GitHub Pages 자동 호스팅 (spec policy.privacy_url=auto-github-pages).
// 배포 단계(/store-deploy)에서 실제 게시 URL로 확정된다.
const PRIVACY_POLICY_URL = 'https://zihado.github.io/jipgap-note-policy/privacy.html';

const openPrivacyPolicy = async (): Promise<void> => {
  try {
    await Linking.openURL(PRIVACY_POLICY_URL);
  } catch {
    Toast.show({
      type: 'error',
      text1: '링크를 열지 못했어요',
      text2: '잠시 후 다시 시도해 주세요',
    });
  }
};

export default function SettingsScreen(): React.JSX.Element {
  useScreenTracking('settings');
  const router = useRouter();
  return (
    <Screen>
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="h1" className="mt-2">
          설정
        </AppText>

        {/* 화면 */}
        <AppText variant="label" className="mt-6 px-1">
          화면
        </AppText>
        <Card padding="none" className="mt-2">
          <SettingsRow label="테마" right={<ThemeSelector />} isLast />
        </Card>

        {/* 데이터 */}
        <AppText variant="label" className="mt-4 px-1">
          데이터
        </AppText>
        <Card padding="none" className="mt-2">
          <CacheClearRow />
          <SettingsRow label="데이터 출처" description={DATA_SOURCE_NOTICE_TEXT} isLast />
        </Card>

        {/* 정보 */}
        <AppText variant="label" className="mt-4 px-1">
          정보
        </AppText>
        <Card padding="none" className="mt-2">
          <SettingsRow
            label="개인정보처리방침"
            onPress={() => {
              void openPrivacyPolicy();
            }}
            accessory="external"
          />
          <SettingsRow
            label="오픈소스 라이선스"
            onPress={() => router.push('/licenses')}
            accessory="chevron"
          />
          <SettingsRow
            label="버전"
            right={
              <AppText variant="caption" tone="faint">
                {env.APP_VERSION}
              </AppText>
            }
            isLast
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}
