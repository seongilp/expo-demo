// 홈 관심 단지 카드 (F-005, screen-layouts.md §1) — Card elevated 유일 허용처.
// 단지명+지역+최신 거래(금액/면적/층/계약일) + ★ 토글. 길게 누르면 해제.
// 가격 로딩은 가격 영역만 스켈레톤 — 카드 전체 스켈레톤 금지 (단지명은 로컬 데이터).
import { View, Pressable } from 'react-native';
import { Card, AppText, Badge, SkeletonPrice } from '@/shared/ui';
import {
  formatDealAmount,
  formatAreaWithPyeong,
  formatDealDateShort,
  isWithinDays,
} from '@/shared/lib';
import {
  FavoriteStarButton,
  useFavoriteToggle,
  IFavoriteApartment,
  IFavoriteSummary,
} from '@/features/favorites';

const NEW_BADGE_DAYS = 7;

interface IFavoriteAptCardProps {
  favorite: IFavoriteApartment;
  /** 키 부재(undefined) = 아직 로딩 전 */
  summary: IFavoriteSummary | undefined;
  isLoading: boolean;
  onPress: () => void;
}

export function FavoriteAptCard({
  favorite,
  summary,
  isLoading,
  onPress,
}: IFavoriteAptCardProps): React.JSX.Element {
  const { toggle } = useFavoriteToggle();
  const latest = summary?.latest ?? null;
  const isPriceLoading = isLoading && summary === undefined;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => toggle(favorite)}
      accessibilityRole="button"
      accessibilityLabel={`${favorite.aptNm} 단지 상세 보기. 길게 누르면 관심 해제`}
      className="active:opacity-85"
    >
      <Card variant="elevated" className="mt-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <AppText variant="h3" numberOfLines={1}>
              {favorite.aptNm}
            </AppText>
            <AppText variant="caption" className="mt-0.5" numberOfLines={1}>
              {favorite.regionName}
            </AppText>
          </View>
          <FavoriteStarButton apartment={favorite} />
        </View>

        <View className="mt-2">
          {isPriceLoading ? (
            <SkeletonPrice className="h-8 w-32" />
          ) : latest ? (
            <>
              <AppText variant="priceLg">{formatDealAmount(latest.dealAmount)}</AppText>
              <View className="mt-1 flex-row items-center gap-1.5">
                <AppText variant="caption" tone="faint">
                  {formatAreaWithPyeong(latest.excluUseAr)} · {latest.floor}층 ·{' '}
                  {formatDealDateShort(latest.dealDate)} 계약
                </AppText>
                {isWithinDays(latest.dealDate, NEW_BADGE_DAYS) ? (
                  <Badge label="신규" variant="new" />
                ) : null}
              </View>
            </>
          ) : (
            <AppText variant="caption" tone="sub">
              최근 3개월 거래가 없어요
            </AppText>
          )}
        </View>
      </Card>
    </Pressable>
  );
}
