// AdMob 광고 설정 — Adaptive Banner 단일 포맷 (spec monetization.ad_formats=[banner]).
// Placement 2개: 단지 상세 / 지역 단지 리스트 하단 anchored (홈/검색/설정 배치 금지).
// dev/preview 빌드는 Google 테스트 ID, production만 실 ID — 무효 트래픽 격리.
import { Platform } from 'react-native';
import { env } from './env';

interface IAdUnitIds {
  /** 단지 상세 화면 하단 anchored (주 수익원 — 체류 시간 최장) */
  BANNER_APT_DETAIL: string;
  /** 지역 단지 리스트 하단 anchored */
  BANNER_REGION_LIST: string;
}

// TODO: AdMob Console에서 발급한 실제 광고 단위 ID로 교체 (store-admob 스킬)
const IOS_AD_UNITS: IAdUnitIds = {
  BANNER_APT_DETAIL: 'ca-app-pub-XXXXX/YYYYY',
  BANNER_REGION_LIST: 'ca-app-pub-XXXXX/YYYYY',
};

// TODO: AdMob Console에서 발급한 실제 광고 단위 ID로 교체 (store-admob 스킬)
const ANDROID_AD_UNITS: IAdUnitIds = {
  BANNER_APT_DETAIL: 'ca-app-pub-XXXXX/ZZZZZ',
  BANNER_REGION_LIST: 'ca-app-pub-XXXXX/ZZZZZ',
};

// Google 공식 Adaptive Banner 테스트 단위 — dev/preview 빌드 전용
const IOS_TEST_AD_UNITS: IAdUnitIds = {
  BANNER_APT_DETAIL: 'ca-app-pub-3940256099942544/2435281174',
  BANNER_REGION_LIST: 'ca-app-pub-3940256099942544/2435281174',
};

const ANDROID_TEST_AD_UNITS: IAdUnitIds = {
  BANNER_APT_DETAIL: 'ca-app-pub-3940256099942544/9214589741',
  BANNER_REGION_LIST: 'ca-app-pub-3940256099942544/9214589741',
};

const getPlatformAdUnits = (): IAdUnitIds =>
  Platform.OS === 'ios' ? IOS_AD_UNITS : ANDROID_AD_UNITS;

const getPlatformTestAdUnits = (): IAdUnitIds =>
  Platform.OS === 'ios' ? IOS_TEST_AD_UNITS : ANDROID_TEST_AD_UNITS;

export const AdUnitIds: IAdUnitIds = env.IS_PROD
  ? getPlatformAdUnits()
  : getPlatformTestAdUnits();

/**
 * 실광고 ID 빌드(preview/TestFlight 내부 배포)에서 사용할 테스트 기기 ID.
 * 기기 ID는 첫 광고 요청 시 네이티브 로그에 출력된다 — 내부 배포 전 반드시 등록
 * (무효 트래픽 방지 Hard Threshold: 미등록 상태로 내부 배포 금지).
 * 에뮬레이터/시뮬레이터는 SDK가 자동으로 테스트 기기 취급 — 별도 등록 불필요.
 */
export const TEST_DEVICE_IDS: string[] = [];

/** 무효 트래픽 방어 정책 (PRD §6 — 배너 단일이므로 전면 광고 정책 없음) */
export const ADS_CONFIG = {
  /** 배너 클릭 가드 — 일일 허용 클릭 수 (초과 시 배너 숨김) */
  BANNER_CLICK_DAILY_LIMIT: 5,
  /** 클릭 가드 발동 시 배너 숨김 지속 시간 */
  BANNER_SUPPRESS_HOURS: 24,
  /** 배너 로드 실패 재시도 — 지수 백오프 기본 지연 (2s → 4s → 8s) */
  BANNER_RETRY_BASE_DELAY_MS: 2_000,
  /** 배너 로드 실패 최대 재시도 횟수 (초과 시 collapse 유지) */
  BANNER_RETRY_MAX_ATTEMPTS: 3,
} as const;
