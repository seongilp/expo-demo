// 국토부 실거래 XML 응답 파서 (R-4).
// fast-xml-parser로 XML→객체 변환 후, Zod 스키마로 경계 검증해
// `TTradeResponseDto`(items 항상 배열)로 정규화한다.
// 거래금액 콤마 제거/면적 number 변환 등 값 정규화는 entities/transaction(transform)이
// 담당하고, 이 레이어는 "구조" 정규화와 에러 분류까지만 책임진다.
import { XMLParser } from 'fast-xml-parser';
import { EMolitErrorReason, MolitApiError } from './errors';
import {
  openApiErrorSchema,
  tradeBodySchema,
  tradeHeaderSchema,
  tradeResponseSchema,
  TTradeResponseDto,
} from './schemas';

// parseTagValue=false — "124,500" 같은 콤마 금액/선행 0 코드 보존 (문자열 유지)
const xmlParser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  trimValues: true,
});

const SUCCESS_CODES = new Set(['000', '00', '0']);
const QUOTA_EXCEEDED_CODE = '22';
const INVALID_KEY_CODES = new Set(['30', '31', '32']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** 단일 item이 객체로, 다건이 배열로 오는 XML 특성을 항상 배열로 정규화 */
const toArray = (value: unknown): unknown[] => {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
};

const throwOpenApiError = (envelope: unknown): never => {
  const parsed = openApiErrorSchema.safeParse(envelope);
  if (!parsed.success) {
    throw new MolitApiError(EMolitErrorReason.PARSE, '공공 API 에러 응답 형식이 올바르지 않습니다');
  }
  const { returnReasonCode, returnAuthMsg, errMsg } = parsed.data.cmmMsgHeader;
  const code = String(returnReasonCode).trim();
  const message = returnAuthMsg || errMsg || `OpenAPI error (code ${code})`;

  if (code === QUOTA_EXCEEDED_CODE) {
    throw new MolitApiError(EMolitErrorReason.QUOTA_EXCEEDED, message, code);
  }
  if (INVALID_KEY_CODES.has(code)) {
    throw new MolitApiError(EMolitErrorReason.INVALID_KEY, message, code);
  }
  throw new MolitApiError(EMolitErrorReason.SERVER, message, code);
};

/**
 * 실거래 응답 XML → 검증된 응답 DTO.
 * - data.go.kr 공통 에러 envelope → quota/invalid_key/server로 분류해 throw
 * - resultCode 비정상 → server 에러로 throw
 * - 구조/스키마 불일치 → parse 에러로 throw
 */
export const parseTradesXml = (xml: string): TTradeResponseDto => {
  if (typeof xml !== 'string' || xml.trim().length === 0) {
    throw new MolitApiError(EMolitErrorReason.PARSE, '빈 응답을 받았습니다');
  }

  let document: unknown;
  try {
    document = xmlParser.parse(xml);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new MolitApiError(EMolitErrorReason.PARSE, `XML 파싱 실패: ${detail}`);
  }

  if (!isRecord(document)) {
    throw new MolitApiError(EMolitErrorReason.PARSE, 'XML 루트가 객체가 아닙니다');
  }

  // data.go.kr 공통 에러 envelope (쿼터 초과/키 오류 등)
  if (isRecord(document.OpenAPI_ServiceResponse)) {
    throwOpenApiError(document.OpenAPI_ServiceResponse);
  }

  const response = document.response;
  if (!isRecord(response)) {
    throw new MolitApiError(EMolitErrorReason.PARSE, '<response> 루트가 없습니다');
  }

  const header = tradeHeaderSchema.safeParse(response.header);
  if (!header.success) {
    throw new MolitApiError(EMolitErrorReason.PARSE, '응답 header 검증 실패');
  }

  const resultCode = String(header.data.resultCode).trim();
  if (!SUCCESS_CODES.has(resultCode)) {
    throw new MolitApiError(
      EMolitErrorReason.SERVER,
      header.data.resultMsg || `resultCode ${resultCode}`,
      resultCode,
    );
  }

  const rawBody = isRecord(response.body) ? response.body : {};
  const rawItems = isRecord(rawBody.items) ? toArray(rawBody.items.item) : toArray(rawBody.items);

  const body = tradeBodySchema.safeParse({
    items: rawItems,
    totalCount: rawBody.totalCount,
    pageNo: rawBody.pageNo,
    numOfRows: rawBody.numOfRows,
  });
  if (!body.success) {
    throw new MolitApiError(
      EMolitErrorReason.PARSE,
      `실거래 item 스키마 검증 실패: ${body.error.issues[0]?.message ?? 'unknown issue'}`,
    );
  }

  return tradeResponseSchema.parse({ header: header.data, body: body.data });
};
