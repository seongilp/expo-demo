// aptKey 합성/파싱 — 실거래 API에는 단지 고유 ID가 없어 `{lawdCd}:{aptNm}`로 식별한다.
import type { TLawdCd } from '@/entities/region';
import type { TAptKey } from '../types';

const SEPARATOR = ':';
const LAWD_CD_PATTERN = /^\d{5}$/;

export interface IParsedAptKey {
  lawdCd: TLawdCd;
  aptNm: string;
}

/** 시군구 코드 형식(5자리 숫자) 검증 */
export const isValidLawdCd = (value: string): boolean => LAWD_CD_PATTERN.test(value);

/** aptKey 합성. 잘못된 입력이면 null (시스템 경계 검증). */
export const makeAptKey = (lawdCd: TLawdCd, aptNm: string): TAptKey | null => {
  const trimmedName = aptNm.trim();
  if (!isValidLawdCd(lawdCd) || trimmedName.length === 0) return null;
  return `${lawdCd}${SEPARATOR}${trimmedName}`;
};

/** aptKey 파싱. 단지명에 ':'가 포함될 수 있어 첫 구분자에서만 분리. 비정상이면 null. */
export const parseAptKey = (aptKey: TAptKey): IParsedAptKey | null => {
  const separatorIndex = aptKey.indexOf(SEPARATOR);
  if (separatorIndex < 0) return null;

  const lawdCd = aptKey.slice(0, separatorIndex);
  const aptNm = aptKey.slice(separatorIndex + 1).trim();
  if (!isValidLawdCd(lawdCd) || aptNm.length === 0) return null;

  return { lawdCd, aptNm };
};
