// 지역명 검색 인덱스 — 부분 일치 + 초성 검색 (로컬 번들, 네트워크 불필요).
import type { IRegion } from '../types';
import { getAllRegions, formatRegionName } from './region-map';

const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;
const JUNGSUNG_COUNT = 21;
const JONGSUNG_COUNT = 28;

/** 한글 음절 → 초성 문자열 ("종로구" → "ㅈㄹㄱ"). 비한글 문자는 그대로 유지. */
export const extractChosung = (text: string): string =>
  Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code < HANGUL_SYLLABLE_START || code > HANGUL_SYLLABLE_END) return char;
      const offset = code - HANGUL_SYLLABLE_START;
      const chosungIndex = Math.floor(offset / (JUNGSUNG_COUNT * JONGSUNG_COUNT));
      return CHOSUNG_LIST[chosungIndex];
    })
    .join('');

/** 검색어 정규화 — 공백 제거 + 소문자화 */
export const normalizeSearchText = (text: string): string =>
  text.replace(/\s+/g, '').toLowerCase();

const isChosungOnly = (text: string): boolean =>
  text.length > 0 && Array.from(text).every((char) => (CHOSUNG_LIST as readonly string[]).includes(char));

interface IRegionIndexEntry {
  region: IRegion;
  /** 정규화된 전체 표기 ("서울특별시종로구") */
  fullName: string;
  /** 정규화된 시군구명 ("종로구") */
  sigungu: string;
  /** 시군구명 초성 ("ㅈㄹㄱ") */
  sigunguChosung: string;
}

const buildIndex = (): readonly IRegionIndexEntry[] =>
  getAllRegions().map((region) => {
    const sigungu = normalizeSearchText(region.sigungu);
    return {
      region,
      fullName: normalizeSearchText(formatRegionName(region)),
      sigungu,
      sigunguChosung: extractChosung(sigungu),
    };
  });

const INDEX: readonly IRegionIndexEntry[] = buildIndex();

const DEFAULT_LIMIT = 10;

/**
 * 지역 검색 — 시군구명/전체명 부분 일치 + 초성 일치.
 * 시군구명 전방 일치 > 시군구명 포함 > 전체명 포함 순으로 정렬.
 */
export const searchRegions = (query: string, limit: number = DEFAULT_LIMIT): IRegion[] => {
  const normalized = normalizeSearchText(query);
  if (normalized.length === 0) return [];

  const chosungQuery = isChosungOnly(normalized) ? normalized : null;

  const scored = INDEX.reduce<{ region: IRegion; score: number }[]>((acc, entry) => {
    let score = -1;
    if (entry.sigungu.startsWith(normalized)) score = 0;
    else if (entry.sigungu.includes(normalized)) score = 1;
    else if (entry.fullName.includes(normalized)) score = 2;
    else if (chosungQuery && entry.sigunguChosung.startsWith(chosungQuery)) score = 3;
    else if (chosungQuery && entry.sigunguChosung.includes(chosungQuery)) score = 4;

    return score >= 0 ? [...acc, { region: entry.region, score }] : acc;
  }, []);

  return scored
    .sort((a, b) => a.score - b.score || a.region.lawdCd.localeCompare(b.region.lawdCd))
    .slice(0, Math.max(0, limit))
    .map((item) => item.region);
};
