// 목 XML(실 API 스키마 동일)로 파서/검증 선행 검증 (02-data-layer QA — R-4).
// 상대 경로 import — vitest node 환경에서 expo 모듈 의존 없이 실행 가능해야 한다.
import { describe, expect, test } from 'vitest';
import { buildMockTradesXml, MOCK_QUOTA_EXCEEDED_XML } from '../mocks/trades.mock';
import { EMolitErrorReason, MolitApiError } from './errors';
import { parseTradesXml } from './parser';

describe('parseTradesXml', () => {
  test('parses mock XML into validated items (comma amounts preserved as strings)', () => {
    const xml = buildMockTradesXml('11680', '202605');
    const parsed = parseTradesXml(xml);

    expect(String(parsed.header.resultCode)).toBe('000');
    expect(parsed.body.items.length).toBeGreaterThanOrEqual(6);
    expect(Number(parsed.body.totalCount)).toBe(parsed.body.items.length);

    const first = parsed.body.items[0];
    expect(first.aptNm.length).toBeGreaterThan(0);
    // parseTagValue=false — 콤마 금액이 문자열로 보존되어야 transform이 정규화 가능
    expect(typeof first.dealAmount).toBe('string');
    expect(String(first.dealAmount)).toMatch(/[\d,]/);
    expect(String(first.dealYear)).toBe('2026');
  });

  test('is deterministic for the same lawdCd × dealYmd', () => {
    expect(buildMockTradesXml('11710', '202601')).toBe(buildMockTradesXml('11710', '202601'));
  });

  test('includes canceled and direct-deal cases in mock data', () => {
    // 시드 결정적이므로 여러 월을 합치면 해제/직거래 케이스가 반드시 포함된다
    const items = ['202601', '202602', '202603', '202604'].flatMap(
      (dealYmd) => parseTradesXml(buildMockTradesXml('11680', dealYmd)).body.items,
    );
    expect(items.some((item) => item.cdealType === 'O' && Boolean(item.cdealDay))).toBe(true);
    expect(items.some((item) => item.dealingGbn === '직거래')).toBe(true);
  });

  test('classifies data.go.kr quota envelope as quota_exceeded', () => {
    try {
      parseTradesXml(MOCK_QUOTA_EXCEEDED_XML);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(MolitApiError);
      expect((error as MolitApiError).reason).toBe(EMolitErrorReason.QUOTA_EXCEEDED);
      expect((error as MolitApiError).code).toBe('22');
    }
  });

  test('throws parse error for malformed/empty payloads', () => {
    expect(() => parseTradesXml('')).toThrowError(MolitApiError);
    expect(() => parseTradesXml('<foo/>')).toThrowError(MolitApiError);
  });

  test('treats non-success resultCode as server error', () => {
    const xml =
      '<response><header><resultCode>99</resultCode><resultMsg>FAIL</resultMsg></header></response>';
    try {
      parseTradesXml(xml);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect((error as MolitApiError).reason).toBe(EMolitErrorReason.SERVER);
    }
  });
});
