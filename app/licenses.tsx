// 오픈소스 라이선스 (US-502) — 설정 화면에서 push. 전부 로컬, 네트워크 없음.
import { useRouter } from 'expo-router';
import { Screen, ScreenHeader } from '@/shared/ui';
import { useScreenTracking } from '@/shared/analytics';
import { LicenseList } from '@/features/settings';

export default function LicensesScreen(): React.JSX.Element {
  useScreenTracking('licenses');
  const router = useRouter();
  return (
    <Screen>
      <ScreenHeader title="오픈소스 라이선스" onBack={() => router.back()} />
      <LicenseList />
    </Screen>
  );
}
