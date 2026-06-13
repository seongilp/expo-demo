import Constants from 'expo-constants';

interface IExpoConfigExtra {
  apiUrl?: string;
  nodeEnv?: string;
  debug?: boolean;
  logLevel?: string;
  appVersion?: string;
  eas?: {
    projectId?: string;
  };
}

const extra = (Constants.expoConfig?.extra || {}) as IExpoConfigExtra;

/** RN 런타임 외(vitest node 등)에서는 __DEV__가 없으므로 안전 접근 */
const IS_DEV_BUILD = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

/**
 * 목 데이터 스위치 (02-data-layer):
 * - `EXPO_PUBLIC_USE_MOCK`가 명시되면 그 값을 그대로 따른다 ('true'만 활성).
 * - 미설정 시 개발 빌드(__DEV__)는 **true** — API 키 없이 클론 직후 전 화면 동작 보장.
 *   프로덕션 빌드는 항상 false 기본 (목 데이터가 스토어 빌드에 노출되는 사고 방지).
 */
function resolveUseMock(): boolean {
  const explicit = process.env.EXPO_PUBLIC_USE_MOCK;
  if (explicit != null && explicit !== '') {
    return explicit === 'true';
  }
  return IS_DEV_BUILD;
}

// TODO: [ISSUE-5A-L3] API_URL/buildApiUrl/validateEnv는 자체 서버 부재(spec backend.type)로
// 실사용처가 없는 템플릿 잔존 코드 — 프록시(R-1) 도입 여부 확정 시 정리한다.
function getApiUrl(): string {
  const baseUrl = extra.apiUrl || 'http://localhost:3000';
  if (baseUrl.includes('/api/v1')) {
    return baseUrl;
  }
  const normalizedUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedUrl}/api/v1`;
}

export const env = {
  API_URL: getApiUrl(),
  NODE_ENV: extra.nodeEnv || 'development',
  DEBUG: extra.debug ?? false,
  LOG_LEVEL: extra.logLevel || 'debug',
  APP_VERSION: extra.appVersion || '1.0.0',
  EAS_PROJECT_ID: extra.eas?.projectId || '',
  IS_DEV: (extra.nodeEnv || 'development') === 'development',
  IS_PROD: (extra.nodeEnv || 'development') === 'production',
  IS_EXPO_GO: Constants.appOwnership === 'expo',
  /** 목 데이터 스위치 — true면 shared/api/mocks 사용. 기본값 규칙은 resolveUseMock 참고 */
  USE_MOCK: resolveUseMock(),
  /** 국토교통부 실거래가 공공 API serviceKey (data.go.kr, 디코딩된 키) */
  MOLIT_API_KEY: process.env.EXPO_PUBLIC_MOLIT_API_KEY ?? '',
  /**
   * 국토부 실거래 API base URL — 기본은 data.go.kr 직접 호출.
   * R-1: 키 도용/쿼터 이슈 시 프록시(Cloudflare Workers 등)로 전환할 때
   * 이 env만 교체하면 되도록 추상화한다.
   */
  MOLIT_BASE_URL:
    process.env.EXPO_PUBLIC_MOLIT_BASE_URL ??
    'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade',
} as const;

export function validateEnv(): void {
  const requiredVars: (keyof typeof env)[] = ['API_URL', 'NODE_ENV'];
  const missingVars = requiredVars.filter((key) => !env[key]);

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = env.API_URL.endsWith('/') ? env.API_URL.slice(0, -1) : env.API_URL;
  return `${baseUrl}${normalizedPath}`;
}

export default env;
