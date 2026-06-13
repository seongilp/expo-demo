// 좌표 → 시군구 역매핑 (F-007).
// 좌표는 이 함수 호출로 시군구 코드로 변환 후 즉시 폐기한다.
// 저장/전송/Analytics 파라미터 전달 금지 — lawd_cd 수준만 허용.
import { findNearestRegion, IRegion } from '@/entities/region';
import type { ICoords } from '../types';

/**
 * 좌표를 가장 가까운 시군구로 역매핑.
 * 번들 좌표 기준 최근접 시군구 중심이 임계 거리(40km)를 넘으면 null (서비스 외 지역).
 */
export const resolveRegionFromCoords = (coords: ICoords): IRegion | null =>
  findNearestRegion(coords.latitude, coords.longitude);
