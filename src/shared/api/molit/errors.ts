// 국토부 공공 API 에러 표준화 (R-2/R-3/R-4).
// 모든 실패는 MolitApiError로 변환해 throw — silently swallow 금지.
// 에러 컨텍스트에 serviceKey가 노출되지 않도록 URL은 항상 마스킹한다.

/** 표준 에러 분류 — UI 메시지/재시도 정책 분기 기준 */
export enum EMolitErrorReason {
  /** 네트워크 단절/DNS 실패 등 요청 자체가 도달하지 못함 */
  NETWORK = 'network',
  /** 타임아웃 (10s) */
  TIMEOUT = 'timeout',
  /** 5xx 등 서버 오류 */
  SERVER = 'server',
  /** 일일 쿼터 초과 (data.go.kr returnReasonCode 22) — R-2 */
  QUOTA_EXCEEDED = 'quota_exceeded',
  /** 등록되지 않은/만료된 serviceKey (returnReasonCode 30/31) */
  INVALID_KEY = 'invalid_key',
  /** XML 파싱/스키마 검증 실패 — R-4 */
  PARSE = 'parse',
  UNKNOWN = 'unknown',
}

/** URL/메시지에서 serviceKey 값을 마스킹 (로그 노출 방지 — Hard Threshold) */
export const maskServiceKey = (text: string): string =>
  text.replace(/(serviceKey=)[^&\s'"]+/gi, '$1***');

export class MolitApiError extends Error {
  readonly reason: EMolitErrorReason;
  /** data.go.kr OpenAPI returnReasonCode 또는 HTTP status (있는 경우) */
  readonly code: string | null;

  constructor(reason: EMolitErrorReason, message: string, code: string | null = null) {
    super(maskServiceKey(message));
    this.name = 'MolitApiError';
    this.reason = reason;
    this.code = code;
  }
}

/** unknown 에러를 MolitApiError로 정규화 (이미 변환된 경우 그대로 통과) */
export const toMolitApiError = (error: unknown): MolitApiError => {
  if (error instanceof MolitApiError) return error;
  if (error instanceof Error) {
    return new MolitApiError(EMolitErrorReason.UNKNOWN, error.message);
  }
  return new MolitApiError(EMolitErrorReason.UNKNOWN, String(error));
};
