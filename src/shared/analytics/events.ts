// 커스텀 이벤트 카탈로그 — `_workspace/plan/kpis.md` 16종의 단일 출처.
// 규칙: snake_case 동사_명사 / 이름 ≤ 40자 / Firebase 예약어(session_start,
// screen_view, first_open, ad_impression 등) 커스텀 정의 금지 /
// PII·정확한 위치(좌표/주소) 파라미터 금지 — 위치는 lawd_cd(시군구 5자리)까지만.

/** 단지 상세 진입 경로 (view_apartment_detail.entry_point) */
export type TApartmentEntryPoint = 'search' | 'region_list' | 'nearby' | 'favorite' | 'recent';

/** activation.feature_id — kpis 정의 4종 (entry 'recent'는 'search'로 귀속) */
export type TActivationFeatureId = 'search' | 'region_list' | 'nearby' | 'favorite';

/** use_nearby_search.permission_result */
export type TNearbyPermissionResult = 'granted' | 'denied' | 'blocked';

/** fail_trade_fetch.reason — R-2(quota)/R-3(timeout·server)/R-4(parse) 모니터링 */
export type TTradeFetchFailReason = 'timeout' | 'server' | 'parse' | 'quota';

/** tap_recent_search.entry_type */
export type TRecentSearchEntryType = 'apartment' | 'region';

/** toggle_dark_mode.mode */
export type TThemeModeParam = 'system' | 'light' | 'dark';

export const EVENTS = {
  /** 생애 최초 단지 상세 실거래 로드 완료 (1회) — 활성 축 (F-002) */
  ACTIVATION: 'activation',
  /** 자동완성에서 지역(시군구) 선택 (F-001) */
  SEARCH_REGION: 'search_region',
  /** 자동완성에서 단지 선택 (F-001) */
  SEARCH_APARTMENT: 'search_apartment',
  /** 단지 상세 진입 + 실거래 로드 완료 — 북극성 분자 (F-002) */
  VIEW_APARTMENT_DETAIL: 'view_apartment_detail',
  /** 지역 단지 리스트 로드 완료 (F-008) */
  VIEW_REGION_LIST: 'view_region_list',
  /** 실거래 리스트 과거 월 추가 로드 (F-002) */
  LOAD_MORE_TRADES: 'load_more_trades',
  /** 추이 차트 12/24개월 토글 (F-003) */
  TOGGLE_CHART_PERIOD: 'toggle_chart_period',
  /** 평형별 비교에서 면적 구간 선택 (F-004) */
  SELECT_AREA_GROUP: 'select_area_group',
  /** 관심 단지 등록 (F-005) — 유지 축 */
  ADD_FAVORITE_APARTMENT: 'add_favorite_apartment',
  /** 관심 단지 해제 (F-005) */
  REMOVE_FAVORITE_APARTMENT: 'remove_favorite_apartment',
  /** 홈 관심 단지 카드 탭 (F-005) */
  TAP_FAVORITE_CARD: 'tap_favorite_card',
  /** 최근 검색 항목 탭 (F-006) */
  TAP_RECENT_SEARCH: 'tap_recent_search',
  /** "내 주변" 버튼 탭 — 권한 결과 포함 (F-007) */
  USE_NEARBY_SEARCH: 'use_nearby_search',
  /** 테마 설정 변경 (F-009) */
  TOGGLE_DARK_MODE: 'toggle_dark_mode',
  /** 설정에서 캐시 초기화 실행 (F-014) */
  CLEAR_QUERY_CACHE: 'clear_query_cache',
  /** 실거래 API 최종 실패 — 재시도 소진 (F-002, R-2~R-4) */
  FAIL_TRADE_FETCH: 'fail_trade_fetch',
} as const;

export type TEventName = (typeof EVENTS)[keyof typeof EVENTS];

/** 이벤트별 파라미터 계약 — kpis.md 카탈로그와 1:1. undefined = 파라미터 없음 */
export interface IEventParamsMap {
  [EVENTS.ACTIVATION]: { feature_id: TActivationFeatureId; elapsed_sec: number };
  [EVENTS.SEARCH_REGION]: { lawd_cd: string; query_length: number };
  [EVENTS.SEARCH_APARTMENT]: { lawd_cd: string; query_length: number };
  [EVENTS.VIEW_APARTMENT_DETAIL]: {
    lawd_cd: string;
    entry_point: TApartmentEntryPoint;
    trade_count: number;
    from_cache: boolean;
  };
  [EVENTS.VIEW_REGION_LIST]: { lawd_cd: string; apt_count: number };
  [EVENTS.LOAD_MORE_TRADES]: { lawd_cd: string; month_depth: number };
  [EVENTS.TOGGLE_CHART_PERIOD]: { period_months: number };
  [EVENTS.SELECT_AREA_GROUP]: { area_group: number };
  [EVENTS.ADD_FAVORITE_APARTMENT]: { lawd_cd: string; favorite_count: number };
  [EVENTS.REMOVE_FAVORITE_APARTMENT]: { lawd_cd: string; favorite_count: number };
  [EVENTS.TAP_FAVORITE_CARD]: { lawd_cd: string };
  [EVENTS.TAP_RECENT_SEARCH]: { entry_type: TRecentSearchEntryType };
  [EVENTS.USE_NEARBY_SEARCH]: {
    permission_result: TNearbyPermissionResult;
    /** granted + 시군구 매핑 성공 시에만 — 좌표/주소 문자열 절대 금지 */
    lawd_cd?: string;
  };
  [EVENTS.TOGGLE_DARK_MODE]: { mode: TThemeModeParam };
  [EVENTS.CLEAR_QUERY_CACHE]: undefined;
  [EVENTS.FAIL_TRADE_FETCH]: { reason: TTradeFetchFailReason; lawd_cd: string };
}
