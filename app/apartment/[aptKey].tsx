// 단지 상세 (F-002~F-005/F-012 조합, screen-layouts.md §5) — Flow A 종착지.
// 단일 FlashList(TransactionList) 헤더에 AptDetailSummary 위젯을 얹어 중첩 스크롤 회피.
// 캐시 히트 시 즉시 렌더, 에러 시에도 로컬 정보(단지명/주소)와 ★ 토글은 항상 동작.
// 하단 배너 1개 (BANNER_APT_DETAIL) — 미로드 collapse + contentPadding 보정.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, ScreenHeader, AppText, EmptyState, SkeletonListItem } from '@/shared/ui';
import { AdUnitIds } from '@/shared/config';
import { toPyeongRounded, recentDealYms } from '@/shared/lib';
import { tradeKeys } from '@/shared/api';
import {
  EVENTS,
  logEvent,
  logActivationOnce,
  useScreenTracking,
  type TApartmentEntryPoint,
} from '@/shared/analytics';
import { parseAptKey, getApartmentsByRegion, isSameAptName } from '@/entities/apartment';
import { getRegionName } from '@/entities/region';
import type { ITransaction } from '@/entities/transaction';
import {
  useTradeHistory,
  TransactionList,
  ITradeMonthSection,
  INITIAL_MONTHS,
} from '@/features/trade-history';
import { TSelectedAreaGroup } from '@/features/price-chart';
import { FavoriteStarButton } from '@/features/favorites';
import { useRecentSearchStore } from '@/features/search';
import { AdBanner } from '@/features/ads';
import { AptDetailSummary } from '@widgets/apt-detail-summary';

const LOADING_SKELETON_COUNT = 5;

const ENTRY_POINTS: readonly TApartmentEntryPoint[] = [
  'search',
  'region_list',
  'nearby',
  'favorite',
  'recent',
];

/** 경로 entry 파라미터 → entry_point — 미지정/딥링크는 'search'로 귀속 */
const toEntryPoint = (value: string | undefined): TApartmentEntryPoint =>
  ENTRY_POINTS.includes(value as TApartmentEntryPoint)
    ? (value as TApartmentEntryPoint)
    : 'search';

/** 평형 필터 적용 — 선택 평형 외 거래/빈 월 섹션 제거 */
const filterSectionsByArea = (
  sections: ITradeMonthSection[],
  selectedArea: TSelectedAreaGroup,
): ITradeMonthSection[] => {
  if (selectedArea === null) return sections;
  return sections
    .map((section) => ({
      ...section,
      transactions: section.transactions.filter(
        (transaction) => toPyeongRounded(transaction.excluUseAr) === selectedArea,
      ),
    }))
    .filter((section) => section.transactions.length > 0);
};

const findLatestActive = (sections: ITradeMonthSection[]): ITransaction | null => {
  for (const section of sections) {
    const active = section.transactions.find((transaction) => !transaction.isCanceled);
    if (active) return active;
  }
  return null;
};

export default function ApartmentDetailScreen(): React.JSX.Element {
  useScreenTracking('apartment_detail');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { aptKey, entry } = useLocalSearchParams<{ aptKey: string; entry?: string }>();
  const key = typeof aptKey === 'string' ? aptKey : '';
  const parsed = useMemo(() => parseAptKey(key), [key]);
  const entryPoint = toEntryPoint(typeof entry === 'string' ? entry : undefined);

  const [selectedArea, setSelectedArea] = useState<TSelectedAreaGroup>(null);
  const [bannerHeight, setBannerHeight] = useState(0);

  const { sections, loadState, meta, failedMonths, loadMore } = useTradeHistory(key);
  const addRecentSearch = useRecentSearchStore((state) => state.addRecentSearch);

  // from_cache 스냅샷 — 마운트 시점에 초기 12개월 쿼리가 전부 캐시 적중인지 (네트워크 0)
  const fromCacheRef = useRef<boolean | null>(null);
  if (fromCacheRef.current === null) {
    fromCacheRef.current = parsed
      ? recentDealYms(INITIAL_MONTHS).every(
          (dealYmd) =>
            queryClient.getQueryState(tradeKeys.month(parsed.lawdCd, dealYmd))?.status ===
            'success',
        )
      : false;
  }

  const regionName = parsed ? getRegionName(parsed.lawdCd) : null;

  // 준공년도 — 로컬 번들 우선, 없으면 최신 거래 응답값
  const latestTransaction = useMemo(() => findLatestActive(sections), [sections]);
  const builtYear = useMemo(() => {
    if (!parsed) return null;
    const bundled = getApartmentsByRegion(parsed.lawdCd).find((apartment) =>
      isSameAptName(apartment.aptNm, parsed.aptNm),
    );
    return bundled?.builtYear ?? latestTransaction?.buildYear ?? null;
  }, [parsed, latestTransaction]);

  // 상세 진입 시 최근 검색 자동 기록 (US-103)
  useEffect(() => {
    if (!parsed) return;
    addRecentSearch({
      type: 'apartment',
      aptKey: key,
      aptNm: parsed.aptNm,
      lawdCd: parsed.lawdCd,
      regionName: regionName ?? '',
    });
  }, [parsed, key, regionName, addRecentSearch]);

  const retry = useCallback(() => {
    if (!parsed) return;
    void queryClient.refetchQueries({
      queryKey: tradeKeys.all,
      predicate: (query) =>
        query.queryKey[1] === parsed.lawdCd && query.state.status === 'error',
    });
  }, [queryClient, parsed]);

  // 평형 필터와 무관한 전체 거래 건수 — view_apartment_detail.trade_count
  const totalTradeCount = useMemo(
    () => sections.reduce((sum, section) => sum + section.transactions.length, 0),
    [sections],
  );

  // view_apartment_detail (북극성 분자) — 실거래 로드 완료 시 1회 + activation 생애 1회
  const hasLoggedDetailRef = useRef(false);
  useEffect(() => {
    if (hasLoggedDetailRef.current || !parsed) return;
    if (loadState !== 'success') return;
    hasLoggedDetailRef.current = true;
    logEvent(EVENTS.VIEW_APARTMENT_DETAIL, {
      lawd_cd: parsed.lawdCd,
      entry_point: entryPoint,
      trade_count: totalTradeCount,
      from_cache: fromCacheRef.current ?? false,
    });
    // activation.feature_id는 kpis 4종(search/region_list/nearby/favorite) — recent는 search 귀속
    void logActivationOnce(entryPoint === 'recent' ? 'search' : entryPoint);
  }, [loadState, parsed, entryPoint, totalTradeCount]);

  // 잘못된 경로 파라미터 — 시스템 경계 검증
  if (!parsed) {
    return (
      <Screen>
        <ScreenHeader title="단지 상세" onBack={() => router.back()} />
        <EmptyState
          icon="alert-circle-outline"
          title="단지를 찾을 수 없어요"
          description="검색 화면에서 단지를 다시 선택해 주세요"
          action={{ label: '돌아가기', onPress: () => router.back(), variant: 'ghost' }}
        />
      </Screen>
    );
  }

  const filteredSections = filterSectionsByArea(sections, selectedArea);
  const tradeCount = filteredSections.reduce(
    (sum, section) => sum + section.transactions.length,
    0,
  );
  const isInitialLoading = loadState === 'loading';
  const isError = loadState === 'error';

  const listHeader = (
    <View>
      <AptDetailSummary
        aptKey={key}
        aptNm={parsed.aptNm}
        regionName={regionName}
        builtYear={builtYear}
        latestTransaction={latestTransaction}
        isLoading={isInitialLoading}
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
        tradeCount={tradeCount}
      />
      {failedMonths > 0 && !isError ? (
        <AppText variant="caption" tone="sub" className="px-5 pb-1">
          일부 월 데이터를 불러오지 못했어요 — 캐시된 내역을 표시 중이에요
        </AppText>
      ) : null}
    </View>
  );

  const listEmpty = isInitialLoading ? (
    <View>
      {Array.from({ length: LOADING_SKELETON_COUNT }, (_, index) => (
        <SkeletonListItem key={index} />
      ))}
    </View>
  ) : isError ? (
    <EmptyState
      icon="cloud-offline-outline"
      title="거래 정보를 불러오지 못했어요"
      description="네트워크 확인 후 다시 시도해 주세요"
      action={{ label: '다시 시도', onPress: retry }}
    />
  ) : selectedArea !== null ? (
    <EmptyState
      icon="receipt-outline"
      title="해당 평형의 거래가 없어요"
      description="평형 선택을 해제하면 전체 내역을 볼 수 있어요"
      compact
    />
  ) : (
    <EmptyState
      icon="receipt-outline"
      title="최근 거래 내역이 없어요"
      description="최근 거래가 쌓이면 이곳에 표시돼요"
    />
  );

  return (
    <Screen>
      <ScreenHeader
        title={parsed.aptNm}
        subtitle={regionName ?? undefined}
        onBack={() => router.back()}
        right={
          <FavoriteStarButton
            apartment={{
              aptKey: key,
              aptNm: parsed.aptNm,
              lawdCd: parsed.lawdCd,
              regionName: regionName ?? '',
            }}
          />
        }
      />

      <View className="flex-1">
        <TransactionList
          sections={filteredSections}
          hasMore={meta.hasMore}
          isLoadingMore={loadState === 'loading-more'}
          onLoadMore={loadMore}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={{ paddingBottom: bannerHeight + 12 }}
        />
      </View>

      {/* 화면당 배너 1개 — 체류 최장 화면 (주 수익원), 미로드 시 collapse */}
      <AdBanner unitId={AdUnitIds.BANNER_APT_DETAIL} onHeightChange={setBannerHeight} />
    </Screen>
  );
}
