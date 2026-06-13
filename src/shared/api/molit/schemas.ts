// 국토부 실거래 API 응답 Zod 스키마 — 시스템 경계 검증 (R-4).
// XML 파서(parseTagValue=false)가 문자열 위주로 출력하지만, 설정 변화에
// 견디도록 숫자형 필드는 string|number union을 허용한다.
// entities/transaction의 IRawTradeItem과 구조 정합을 유지한다 (4a 인계 계약).
import { z } from 'zod';

const stringOrNumber = z.union([z.string(), z.number()]);

/** 실거래 item — 필수 최소 필드만 강제, 표기 흔들림 필드는 optional */
export const rawTradeItemSchema = z
  .object({
    aptNm: z.string(),
    /** 거래금액 — 콤마 포함 만원 문자열 (예: " 124,500") */
    dealAmount: stringOrNumber,
    excluUseAr: stringOrNumber,
    dealYear: stringOrNumber,
    dealMonth: stringOrNumber,
    dealDay: stringOrNumber,
    floor: stringOrNumber.optional().default(''),
    buildYear: stringOrNumber.optional(),
    cdealType: z.string().optional(),
    cdealDay: z.string().optional(),
    dealingGbn: z.string().optional(),
    umdNm: z.string().optional(),
    sggCd: stringOrNumber.optional(),
    jibun: stringOrNumber.optional(),
  })
  .loose();

export type TRawTradeItemDto = z.infer<typeof rawTradeItemSchema>;

/** 정상 응답 header — resultCode '000'(신규)/'00'(구형)이 성공 */
export const tradeHeaderSchema = z.object({
  resultCode: stringOrNumber,
  resultMsg: z.string().optional().default(''),
});

export const tradeBodySchema = z.object({
  items: z.array(rawTradeItemSchema),
  totalCount: stringOrNumber.optional().default(0),
  pageNo: stringOrNumber.optional().default(1),
  numOfRows: stringOrNumber.optional().default(0),
});

/** 파서가 정규화한 정상 응답 (items는 항상 배열) */
export const tradeResponseSchema = z.object({
  header: tradeHeaderSchema,
  body: tradeBodySchema,
});

export type TTradeResponseDto = z.infer<typeof tradeResponseSchema>;

/**
 * data.go.kr OpenAPI 공통 에러 envelope —
 * 쿼터 초과(22)/미등록 키(30) 등은 이 형태로 응답된다.
 */
export const openApiErrorSchema = z.object({
  cmmMsgHeader: z.object({
    returnReasonCode: stringOrNumber,
    returnAuthMsg: z.string().optional().default(''),
    errMsg: z.string().optional().default(''),
  }),
});

export type TOpenApiErrorDto = z.infer<typeof openApiErrorSchema>;
