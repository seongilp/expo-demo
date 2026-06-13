// "내 주변 시세" 버튼 (F-007) — 권한/좌표 처리 전부 useNearbyRegion 위임.
// 성공 시 region/[lawdCd] push, 거부/실패 토스트는 훅이 담당 (화면 차단 없음).
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/shared/ui';
import { useThemeTokens } from '@/shared/lib';
import { useNearbyRegion } from '../hooks';

export function NearbyButton(): React.JSX.Element {
  const router = useRouter();
  const { tokens } = useThemeTokens();
  const { resolve, isResolving } = useNearbyRegion();

  const onPress = async (): Promise<void> => {
    const result = await resolve();
    if (result.permission === 'granted' && result.lawdCd !== null) {
      // entry=nearby — 단지 상세 entry_point/activation feature_id 'nearby' 귀속용
      router.push({
        pathname: '/region/[lawdCd]',
        params: { lawdCd: result.lawdCd, entry: 'nearby' },
      });
    }
  };

  return (
    <Button
      title={isResolving ? '내 위치 확인 중' : '내 주변 시세'}
      onPress={() => {
        void onPress();
      }}
      variant="outline"
      size="md"
      loading={isResolving}
      fullWidth
      icon={<Ionicons name="location-outline" size={18} color={tokens.textPrimary} />}
      accessibilityLabel="내 주변 시세 보기"
    />
  );
}
