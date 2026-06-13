// 월별 평균가 / 평형별 집계 단위 테스트 (F-003/F-004, 04-entities QA).
// 해제 거래 제외, 결측 월 제외, 평형 클러스터링, 평균 반올림을 검증한다.
import { describe, expect, test } from 'vitest';
import { ETradeType, type ITransaction } from '../types';
import { aggregateByAreaGroup, aggregateMonthly } from './aggregate';

/** 테스트용 거래 팩토리 — 명시 필드만 받고 나머지는 기본값 */
const makeTransaction = (overrides: Partial<ITransaction> & {
  dealDate: string;
  dealAmount: number;
  excluUseAr: number;
}): ITransaction => {
  const monthKey = overrides.dealDate.slice(0, 7);
  return {
    id: overrides.id ?? `t:${overrides.dealDate}:${overrides.dealAmount}:${overrides.excluUseAr}`,
    lawdCd: overrides.lawdCd ?? '11680',
    aptNm: overrides.aptNm ?? '은마',
    dealAmount: overrides.dealAmount,
    excluUseAr: overrides.excluUseAr,
    floor: overrides.floor ?? 5,
    buildYear: overrides.buildYear ?? 1979,
    dealDate: overrides.dealDate,
    monthKey: overrides.monthKey ?? monthKey,
    tradeType: overrides.tradeType ?? ETradeType.BROKERAGE,
    isCanceled: overrides.isCanceled ?? false,
    umdNm: overrides.umdNm ?? '대치동',
  };
};

describe('aggregateMonthly', () => {
  test('월별로 평균가를 집계하고 monthKey 오름차순 정렬한다', () => {
    const result = aggregateMonthly([
      makeTransaction({ dealDate: '2026-02-10', dealAmount: 200, excluUseAr: 84 }),
      makeTransaction({ dealDate: '2026-01-05', dealAmount: 100, excluUseAr: 84 }),
      makeTransaction({ dealDate: '2026-01-20', dealAmount: 200, excluUseAr: 84 }),
    ]);

    expect(result.map((r) => r.monthKey)).toEqual(['2026-01', '2026-02']);
    expect(result[0]).toMatchObject({ monthKey: '2026-01', averageAmount: 150, count: 2 });
    expect(result[1]).toMatchObject({ monthKey: '2026-02', averageAmount: 200, count: 1 });
  });

  test('해제된 거래(isCanceled)는 평균/건수에서 제외한다', () => {
    const result = aggregateMonthly([
      makeTransaction({ dealDate: '2026-01-05', dealAmount: 100, excluUseAr: 84 }),
      makeTransaction({ dealDate: '2026-01-10', dealAmount: 900, excluUseAr: 84, isCanceled: true }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ averageAmount: 100, count: 1 });
  });

  test('거래가 없는 월은 결과에 포함되지 않는다 (결측 월 단절은 차트 레이어)', () => {
    const result = aggregateMonthly([
      makeTransaction({ dealDate: '2026-01-05', dealAmount: 100, excluUseAr: 84 }),
      makeTransaction({ dealDate: '2026-03-05', dealAmount: 300, excluUseAr: 84 }),
    ]);

    expect(result.map((r) => r.monthKey)).toEqual(['2026-01', '2026-03']);
  });

  test('평균은 반올림된다', () => {
    const result = aggregateMonthly([
      makeTransaction({ dealDate: '2026-01-01', dealAmount: 100, excluUseAr: 84 }),
      makeTransaction({ dealDate: '2026-01-02', dealAmount: 101, excluUseAr: 84 }),
    ]);
    // (100 + 101) / 2 = 100.5 → 101
    expect(result[0].averageAmount).toBe(101);
  });

  test('빈 입력은 빈 배열', () => {
    expect(aggregateMonthly([])).toEqual([]);
  });
});

describe('aggregateByAreaGroup', () => {
  test('같은 반올림 평수끼리 클러스터링하고 평수 오름차순 정렬한다', () => {
    // 84㎡ ≈ 25평, 59㎡ ≈ 18평 (toPyeongRounded = m² / 3.305785 반올림)
    const result = aggregateByAreaGroup([
      makeTransaction({ dealDate: '2026-01-10', dealAmount: 200, excluUseAr: 84.5 }),
      makeTransaction({ dealDate: '2026-01-05', dealAmount: 100, excluUseAr: 59.9 }),
      makeTransaction({ dealDate: '2026-02-01', dealAmount: 220, excluUseAr: 84.9 }),
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].pyeong).toBeLessThan(result[1].pyeong);
    // 84대 그룹: 2건, 평균 (200+220)/2 = 210
    const large = result[1];
    expect(large.count).toBe(2);
    expect(large.averageAmount).toBe(210);
  });

  test('최근 거래(dealDate 최댓값)의 금액/일자를 latest로 채운다', () => {
    const [group] = aggregateByAreaGroup([
      makeTransaction({ dealDate: '2026-01-10', dealAmount: 200, excluUseAr: 84 }),
      makeTransaction({ dealDate: '2026-03-15', dealAmount: 250, excluUseAr: 84 }),
      makeTransaction({ dealDate: '2026-02-20', dealAmount: 230, excluUseAr: 84 }),
    ]);

    expect(group.latestDealDate).toBe('2026-03-15');
    expect(group.latestAmount).toBe(250);
    expect(group.minArea).toBe(84);
    expect(group.maxArea).toBe(84);
  });

  test('해제된 거래는 평형 집계에서 제외한다', () => {
    const result = aggregateByAreaGroup([
      makeTransaction({ dealDate: '2026-01-10', dealAmount: 200, excluUseAr: 84 }),
      makeTransaction({ dealDate: '2026-01-12', dealAmount: 900, excluUseAr: 84, isCanceled: true }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(1);
    expect(result[0].averageAmount).toBe(200);
  });

  test('빈 입력은 빈 배열', () => {
    expect(aggregateByAreaGroup([])).toEqual([]);
  });
});
