// 지역 단지 리스트 (F-008, screen-layouts.md §4) — push 스크린.
// 로딩=행 골격 스켈레톤(스피너 단독 금지) / 에러=재시도(캐시 있으면 hook이 우선 표시) /
// 빈 상태=빈 안내 노출.
import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { Screen, ScreenHeader, AppText, EmptyState, SkeletonListItem } from '@/shared/ui';
import {
  EVENTS,
  logEvent,
  useScreenTracking,
  type TApartmentEntryPoint,
} from '@/shared/analytics';
import { getRegionByCode } from '@/entities/region';
import { isValidLawdCd } from '@/entities/apartment';
import {
  useRegionAptList,
  RegionAptListItem as RegionAptRow,
  IRegionAptListItem,
} from '@/features/search';
import { DataSourceNotice } from '@/features/trade-history';

const LOADING_SKELETON_COUNT = 8;

function LoadingSkeleton(): React.JSX.Element {
  return (
    <View>
      {Array.from({ length: LOADING_SKELETON_COUNT }, (_, index) => (
        <SkeletonListItem key={index} />
      ))}
    </View>
  );
}

export default function RegionAptListScreen(): React.JSX.Element {
  useScreenTracking('region_apt_list');
  const router = useRouter();
  const { lawdCd, entry } = useLocalSearchParams<{ lawdCd: string; entry?: string }>();

  const code = typeof lawdCd === 'string' ? lawdCd : '';
  const region = isValidLawdCd(code) ? getRegionByCode(code) : null;
  const { items, isLoading, isError, retry } = useRegionAptList(code);

  // "내 주변"으로 진입한 리스트에서 연 단지는 entry_point 'nearby'로 귀속 (kpis)
  const apartmentEntry: TApartmentEntryPoint = entry === 'nearby' ? 'nearby' : 'region_list';

  // view_region_list — 리스트 로드 완료 시 1회 (재시도 성공 포함, F-008)
  const hasLoggedViewRef = useRef(false);
  useEffect(() => {
    hasLoggedViewRef.current = false;
  }, [code]);
  useEffect(() => {
    if (hasLoggedViewRef.current) return;
    if (!region || isLoading || isError) return;
    hasLoggedViewRef.current = true;
    logEvent(EVENTS.VIEW_REGION_LIST, { lawd_cd: code, apt_count: items.length });
  }, [region, isLoading, isError, code, items.length]);

  const openApartment = useCallback(
    (item: IRegionAptListItem): void => {
      router.push({
        pathname: '/apartment/[aptKey]',
        params: { aptKey: item.aptKey, entry: apartmentEntry },
      });
    },
    [router, apartmentEntry],
  );

  const renderItem = ({ item }: ListRenderItemInfo<IRegionAptListItem>): React.JSX.Element => (
    <RegionAptRow item={item} onPress={openApartment} />
  );

  // 잘못된 경로 파라미터 — 시스템 경계 검증 (입력 검증 Hard Rule)
  if (!region) {
    return (
      <Screen>
        <ScreenHeader title="지역" onBack={() => router.back()} />
        <EmptyState
          icon="alert-circle-outline"
          title="지역을 찾을 수 없어요"
          description="검색 화면에서 지역을 다시 선택해 주세요"
          action={{ label: '돌아가기', onPress: () => router.back(), variant: 'ghost' }}
        />
      </Screen>
    );
  }

  const tradedCount = items.filter((item) => item.tradeCount > 0).length;
  const showSkeleton = isLoading && items.length === 0;

  return (
    <Screen>
      <ScreenHeader title={region.sigungu} subtitle={region.sido} onBack={() => router.back()} />

      <View className="flex-row items-center justify-between px-5 py-2">
        <AppText variant="caption" tone="sub">
          최근 3개월 거래 단지 {tradedCount}곳
        </AppText>
        <AppText variant="caption" tone="faint">
          최근 거래순
        </AppText>
      </View>

      <View className="flex-1">
        {showSkeleton ? (
          <LoadingSkeleton />
        ) : isError ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="거래 정보를 불러오지 못했어요"
            description="네트워크 확인 후 다시 시도해 주세요"
            action={{ label: '다시 시도', onPress: retry }}
          />
        ) : (
          <FlashList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.aptKey}
            ListEmptyComponent={
              <EmptyState
                icon="business-outline"
                title="최근 거래 내역이 없어요"
                description="다른 지역을 검색해 보세요"
              />
            }
            ListFooterComponent={
              items.length > 0 ? <DataSourceNotice className="mx-5 my-3" /> : null
            }
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  );
}
