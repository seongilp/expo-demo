// 단지명 정규화 매칭 단위 테스트 (R-5, 04-entities QA).
// 오매칭(다른 단지 동일 판정) 0 + 동일단지 표기변형(공백/괄호/구두점) 매칭을 검증한다.
// isSameAptName 정확도는 북극성 지표(view_apartment_detail.trade_count) 신뢰도에 직결.
// 상대 경로 import — vitest node 환경(별칭 미해소)에서 실행 가능해야 한다.
import { describe, expect, test } from 'vitest';
import { isSameAptName, matchesAptName, normalizeAptName } from './normalize-name';

describe('normalizeAptName', () => {
  test('괄호와 괄호 안 내용을 제거한다', () => {
    expect(normalizeAptName('은마(1차)')).toBe('은마');
    expect(normalizeAptName('힐스테이트(101동)')).toBe('힐스테이트');
  });

  test('공백/구두점(·-_.,)을 제거하고 소문자화한다', () => {
    expect(normalizeAptName('래미안 대치팰리스')).toBe('래미안대치팰리스');
    expect(normalizeAptName('e-편한세상')).toBe('e편한세상');
    expect(normalizeAptName('SK·VIEW')).toBe('skview');
  });
});

describe('isSameAptName — 동일단지 표기 변형', () => {
  test('공백 차이만 있는 표기는 동일 단지로 판정', () => {
    expect(isSameAptName('은마 아파트', '은마아파트')).toBe(true);
  });

  test('괄호 부가정보 유무 차이는 동일 단지로 판정', () => {
    expect(isSameAptName('힐스테이트(101동)', '힐스테이트')).toBe(true);
  });

  test('구두점/대소문자 차이는 동일 단지로 판정', () => {
    expect(isSameAptName('e-편한세상', 'E편한세상')).toBe(true);
  });
});

describe('isSameAptName — 오매칭 방지 (다른 단지)', () => {
  test('완전히 다른 단지명은 매칭되지 않는다', () => {
    expect(isSameAptName('래미안', '자이')).toBe(false);
  });

  test('한쪽이 다른 쪽의 접두어여도(부분 포함) 동일로 판정하지 않는다', () => {
    // 정규화는 완전 일치만 동일로 본다 — 부분 포함은 오매칭이므로 false여야 한다
    expect(isSameAptName('래미안대치팰리스', '래미안대치')).toBe(false);
    expect(isSameAptName('힐스테이트', '힐스테이트2차')).toBe(false);
  });

  test('빈 문자열/공백만 있는 입력은 매칭되지 않는다', () => {
    expect(isSameAptName('', '은마')).toBe(false);
    expect(isSameAptName('은마', '')).toBe(false);
    expect(isSameAptName('   ', '(생략)')).toBe(false);
  });
});

describe('matchesAptName — 자동완성 부분 일치', () => {
  test('정규화 후 부분 문자열이면 일치', () => {
    expect(matchesAptName('래미안 대치팰리스', '대치')).toBe(true);
    expect(matchesAptName('은마아파트', '은마')).toBe(true);
  });

  test('포함되지 않으면 불일치', () => {
    expect(matchesAptName('래미안', '자이')).toBe(false);
  });

  test('빈 질의는 불일치', () => {
    expect(matchesAptName('은마', '')).toBe(false);
  });
});
