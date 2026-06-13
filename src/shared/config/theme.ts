// 집값노트 테마 토큰 — 타입 안전 재export.
// 단일 소스는 theme-tokens.js (tailwind.config.js와 공유). hex 중복 기입 금지.
// 차트/네이티브 prop 등 className을 쓸 수 없는 지점은
// `@/shared/lib`의 `useThemeTokens()`를 통해 이 토큰을 소비한다.
import tokens from './theme-tokens';

export interface IThemeTokens {
  background: string;
  surface: string;
  surfaceRaised: string;
  field: string;
  line: string;
  lineStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  primary: string;
  primaryPressed: string;
  priceUp: string;
  priceDown: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  chartLine: string;
  chartGrid: string;
  chartCategorical: string[];
  skeleton: string;
}

export const lightTokens: IThemeTokens = tokens.light;
export const darkTokens: IThemeTokens = tokens.dark;
export const inkPalette = tokens.palette.ink;
