// 아파트 매매 실거래 조회 (data.go.kr 15126468 — RTMSDataSvcAptTrade).
// 목/실 스위치(EXPO_PUBLIC_USE_MOCK)를 이 함수 한 곳에서만 분기한다 —
// 두 경로 모두 동일한 XML→파서→Zod 검증을 거친다.
import { EVENTS, logEvent, recordNonFatal } from '@/shared/analytics';
import type { TTradeFetchFailReason } from '@/shared/analytics';
import { fetchMockTradesXml, isMockEnabled } from '../mocks';
import { molitGet } from '../client';
import { EMolitErrorReason, MolitApiError, toMolitApiError } from './errors';
import { parseTradesXml } from './parser';
import type { TRawTradeItemDto } from './schemas';

const TRADES_PATH = '/getRTMSDataSvcAptTrade';
/** 시군구×월 거래는 통상 수백 건 이하 — 단일 페이지로 전량 조회 */
const DEFAULT_NUM_OF_ROWS = 1000;

const LAWD_CD_PATTERN = /^\d{5}$/;
const DEAL_YMD_PATTERN = /^\d{6}$/;

export interface IGetTradesRequest {
  /** 시군구 코드 5자리 (법정동코드 앞 5자리) */
  lawdCd: string;
  /** 계약 년월 YYYYMM */
  dealYmd: string;
  pageNo?: number;
  numOfRows?: number;
}

export interface IGetTradesResponse {
  /** 검증된 원시 거래 item — entities/transaction의 IRawTradeItem과 구조 동일 */
  items: TRawTradeItemDto[];
  totalCount: number;
}

/**
 * fail_trade_fetch reason 매핑 (kpis.md: timeout/server/parse/quota).
 * NETWORK(사용자 오프라인)는 비액션 노이즈 — 이벤트 미발화.
 */
const FAIL_REASON_MAP: Partial<Record<EMolitErrorReason, TTradeFetchFailReason>> = {
  [EMolitErrorReason.TIMEOUT]: 'timeout',
  [EMolitErrorReason.QUOTA_EXCEEDED]: 'quota',
  [EMolitErrorReason.PARSE]: 'parse',
  [EMolitErrorReason.SERVER]: 'server',
  [EMolitErrorReason.INVALID_KEY]: 'server',
  [EMolitErrorReason.UNKNOWN]: 'server',
};

/**
 * 최종 실패 모니터링 (F-002, R-2~R-4) — 전송 계층 재시도 소진 후 도달하는
 * 유일한 chokepoint. 모든 feature 쿼리(monthlyTradesQueryOptions)가 getTrades를
 * 경유하므로 여기 한 곳의 배선으로 전 화면을 커버한다.
 * 메시지는 MolitApiError가 serviceKey를 이미 마스킹한 상태 (PII/시크릿 0).
 */
const reportTradeFetchFailure = (error: MolitApiError, lawdCd: string): void => {
  if (error.reason === EMolitErrorReason.PARSE) {
    // R-4 — XML 파싱/스키마 실패는 Crashlytics 비치명 리포트 병행 (kpis 검증 노트)
    recordNonFatal(error);
  }
  const reason = FAIL_REASON_MAP[error.reason];
  if (!reason) return;
  logEvent(EVENTS.FAIL_TRADE_FETCH, { reason, lawd_cd: lawdCd });
};

const validateRequest = ({ lawdCd, dealYmd }: IGetTradesRequest): void => {
  if (!LAWD_CD_PATTERN.test(lawdCd)) {
    throw new MolitApiError(EMolitErrorReason.PARSE, `잘못된 시군구 코드: ${lawdCd}`);
  }
  if (!DEAL_YMD_PATTERN.test(dealYmd)) {
    throw new MolitApiError(EMolitErrorReason.PARSE, `잘못된 계약 년월: ${dealYmd}`);
  }
};

/**
 * 시군구×월 매매 실거래 조회.
 * 모든 실패는 MolitApiError(quota/network/timeout/server/parse 등)로 표준화해 throw.
 */
export const getTrades = async (request: IGetTradesRequest): Promise<IGetTradesResponse> => {
  validateRequest(request);
  const { lawdCd, dealYmd, pageNo = 1, numOfRows = DEFAULT_NUM_OF_ROWS } = request;

  try {
    const xml = isMockEnabled()
      ? await fetchMockTradesXml(lawdCd, dealYmd)
      : await molitGet(TRADES_PATH, {
          LAWD_CD: lawdCd,
          DEAL_YMD: dealYmd,
          pageNo,
          numOfRows,
        });

    const parsed = parseTradesXml(xml);
    return {
      items: parsed.body.items,
      totalCount: Number(parsed.body.totalCount) || parsed.body.items.length,
    };
  } catch (error) {
    const normalized = toMolitApiError(error);
    reportTradeFetchFailure(normalized, lawdCd);
    throw normalized;
  }
};
