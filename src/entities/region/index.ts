export type { IRegion, TLawdCd } from './types';
export {
  getAllRegions,
  getRegionByCode,
  getRegionName,
  formatRegionName,
  findNearestRegion,
  searchRegions,
  extractChosung,
  normalizeSearchText,
} from './lib';
