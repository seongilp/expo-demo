// aptNm 정규화 매칭 (R-5) — 실거래 응답의 단지명 표기 흔들림 보정.
// 예: "래미안 대치팰리스(1단지)" ↔ "래미안대치팰리스 1단지" 를 동일 단지로 매칭.

/**
 * 단지명 정규화:
 * 1. 괄호와 괄호 안 내용 제거 → "은마(1차)" → "은마"
 * 2. 공백/구두점(·,-,_,.) 제거
 * 3. 영문 소문자화
 */
export const normalizeAptName = (aptNm: string): string =>
  aptNm
    .replace(/\([^)]*\)/g, '')
    .replace(/[\s·\-_.,]/g, '')
    .toLowerCase();

/** 두 단지명이 정규화 기준으로 동일 단지인지 */
export const isSameAptName = (a: string, b: string): boolean => {
  const normalizedA = normalizeAptName(a);
  const normalizedB = normalizeAptName(b);
  if (normalizedA.length === 0 || normalizedB.length === 0) return false;
  return normalizedA === normalizedB;
};

/** 정규화된 단지명 부분 일치 (자동완성 매칭용) */
export const matchesAptName = (aptNm: string, query: string): boolean => {
  const normalizedName = normalizeAptName(aptNm);
  const normalizedQuery = normalizeAptName(query);
  if (normalizedQuery.length === 0) return false;
  return normalizedName.includes(normalizedQuery);
};
