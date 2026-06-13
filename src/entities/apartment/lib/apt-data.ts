// 로컬 단지 번들 접근자 — data/apt-list.json (scripts/build-apt-list.ts로 갱신).
import aptList from '../data/apt-list.json';
import type { TLawdCd } from '@/entities/region';
import type { IApartment } from '../types';
import { makeAptKey } from './apt-key';

interface IBundledAptRow {
  lawdCd: string;
  aptNm: string;
  builtYear: number | null;
}

const toApartment = (row: IBundledAptRow): IApartment | null => {
  const aptKey = makeAptKey(row.lawdCd, row.aptNm);
  if (!aptKey) return null;
  return {
    aptKey,
    lawdCd: row.lawdCd,
    aptNm: row.aptNm.trim(),
    builtYear: row.builtYear,
  };
};

const APARTMENTS: readonly IApartment[] = (aptList as IBundledAptRow[])
  .map(toApartment)
  .filter((apt): apt is IApartment => apt !== null);

/** 번들된 전체 단지 목록 (불변) */
export const getBundledApartments = (): readonly IApartment[] => APARTMENTS;

/** 시군구 코드의 번들 단지 목록 */
export const getApartmentsByRegion = (lawdCd: TLawdCd): IApartment[] =>
  APARTMENTS.filter((apt) => apt.lawdCd === lawdCd);
