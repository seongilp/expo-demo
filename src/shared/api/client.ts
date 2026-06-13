// 국토부 공공 API 전용 Axios 클라이언트 (02-data-layer).
// - base URL은 env.MOLIT_BASE_URL — 프록시 전환 시 env 교체만으로 대응 (R-1)
// - timeout 10s + 재시도 1회(백오프 800ms) (R-3)
// - serviceKey는 env 경유 주입, 로그에는 절대 노출하지 않는다 (마스킹)
// - 인증 토큰 없음 (게스트 전용 앱 — 토큰 인터셉터 미구현이 정상)
import axios, { AxiosError, AxiosInstance, isAxiosError } from 'axios';
import { env } from '@/shared/config';
import { EMolitErrorReason, MolitApiError, maskServiceKey } from './molit/errors';

const REQUEST_TIMEOUT_MS = 10_000;
const RETRY_BACKOFF_MS = 800;
const MAX_RETRY_COUNT = 1;

// data.go.kr WAF는 기본 RN/okhttp User-Agent 요청을 "Request Blocked"(400 HTML)로 차단한다.
// 브라우저 형태 UA를 명시해야 정상 XML 응답을 받는다.
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export const molitClient: AxiosInstance = axios.create({
  baseURL: env.MOLIT_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  // XML 응답 — axios의 JSON 자동 파싱을 우회하고 원문 문자열 유지
  responseType: 'text',
  transformResponse: [(data: unknown): unknown => data],
  headers: {
    'User-Agent': BROWSER_USER_AGENT,
    Accept: 'application/xml, text/xml, */*',
  },
});

molitClient.interceptors.request.use((config) => {
  if (__DEV__) {
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    // serviceKey 마스킹 — 키가 로그에 남지 않도록 params는 출력하지 않는다
    console.log('[molit] GET', maskServiceKey(url));
  }
  return config;
});

const isRetryable = (error: AxiosError): boolean => {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return true;
  if (!error.response) return true; // 네트워크 단절
  return error.response.status >= 500;
};

const toTransportError = (error: AxiosError): MolitApiError => {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new MolitApiError(EMolitErrorReason.TIMEOUT, '요청 시간이 초과되었습니다 (10s)');
  }
  if (!error.response) {
    return new MolitApiError(
      EMolitErrorReason.NETWORK,
      `네트워크 요청에 실패했습니다: ${error.message}`,
    );
  }
  return new MolitApiError(
    EMolitErrorReason.SERVER,
    `서버 오류 (HTTP ${error.response.status})`,
    String(error.response.status),
  );
};

const delay = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface IMolitGetParams {
  readonly [key: string]: string | number;
}

/**
 * 국토부 API GET — serviceKey 자동 주입 + 재시도 1회(백오프).
 * 전송 계층 실패는 MolitApiError(network/timeout/server)로 표준화해 throw.
 * @returns 응답 XML 원문 문자열 (파싱은 molit/parser 책임)
 */
export const molitGet = async (path: string, params: IMolitGetParams): Promise<string> => {
  if (!env.MOLIT_API_KEY) {
    throw new MolitApiError(
      EMolitErrorReason.INVALID_KEY,
      'EXPO_PUBLIC_MOLIT_API_KEY가 설정되지 않았습니다 (목 모드는 EXPO_PUBLIC_USE_MOCK=true)',
    );
  }

  const requestParams = { ...params, serviceKey: env.MOLIT_API_KEY };

  let lastError: MolitApiError | null = null;
  for (let attempt = 0; attempt <= MAX_RETRY_COUNT; attempt += 1) {
    try {
      const response = await molitClient.get<string>(path, { params: requestParams });
      return response.data;
    } catch (error) {
      if (!isAxiosError(error)) {
        throw new MolitApiError(
          EMolitErrorReason.UNKNOWN,
          error instanceof Error ? error.message : String(error),
        );
      }
      lastError = toTransportError(error);
      const shouldRetry = attempt < MAX_RETRY_COUNT && isRetryable(error);
      if (!shouldRetry) break;
      await delay(RETRY_BACKOFF_MS * (attempt + 1));
    }
  }

  throw lastError ?? new MolitApiError(EMolitErrorReason.UNKNOWN, '요청에 실패했습니다');
};
