// 코드↔이름 매핑 + 좌표→시군구 역매핑 (시군구 중심 좌표 기반).
// 데이터 소스: data/lawd-codes.json (scripts/build-lawd-codes.ts로 갱신).
import lawdCodes from '../data/lawd-codes.json';
import type { IRegion, TLawdCd } from '../types';

const REGIONS: readonly IRegion[] = lawdCodes;

const regionByCode: ReadonlyMap<TLawdCd, IRegion> = new Map(
  REGIONS.map((region) => [region.lawdCd, region]),
);

/** 번들된 전체 시군구 목록 (불변) */
export const getAllRegions = (): readonly IRegion[] => REGIONS;

/** 시군구 코드 → 지역. 없으면 null. */
export const getRegionByCode = (lawdCd: TLawdCd): IRegion | null =>
  regionByCode.get(lawdCd) ?? null;

/** "서울특별시 종로구" 형태 전체 표기 */
export const formatRegionName = (region: IRegion): string =>
  region.sido === region.sigungu ? region.sido : `${region.sido} ${region.sigungu}`;

/** 시군구 코드 → 전체 표기. 없으면 null. */
export const getRegionName = (lawdCd: TLawdCd): string | null => {
  const region = getRegionByCode(lawdCd);
  return region ? formatRegionName(region) : null;
};

const EARTH_RADIUS_KM = 6371;
const DEG_TO_RAD = Math.PI / 180;

/** 두 좌표 간 거리(km) — equirectangular 근사 (시군구 단위 정밀도면 충분) */
const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const x = (lng2 - lng1) * DEG_TO_RAD * Math.cos(((lat1 + lat2) / 2) * DEG_TO_RAD);
  const y = (lat2 - lat1) * DEG_TO_RAD;
  return Math.sqrt(x * x + y * y) * EARTH_RADIUS_KM;
};

const DEFAULT_MAX_DISTANCE_KM = 40;

/**
 * 좌표 → 가장 가까운 시군구 (내 주변 시세 역매핑).
 * 최근접 중심이 maxDistanceKm를 넘으면(해외/번들 외 지역) null.
 * 좌표는 이 함수 호출 후 즉시 폐기한다 — 저장/전송/로깅 금지 (F-007 정책).
 */
export const findNearestRegion = (
  lat: number,
  lng: number,
  maxDistanceKm: number = DEFAULT_MAX_DISTANCE_KM,
): IRegion | null => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const nearest = REGIONS.reduce<{ region: IRegion | null; distance: number }>(
    (best, region) => {
      const distance = distanceKm(lat, lng, region.lat, region.lng);
      return distance < best.distance ? { region, distance } : best;
    },
    { region: null, distance: Number.POSITIVE_INFINITY },
  );

  if (!nearest.region || nearest.distance > maxDistanceKm) return null;
  return nearest.region;
};
