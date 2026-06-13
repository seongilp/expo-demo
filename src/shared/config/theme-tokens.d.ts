// Type declaration for theme-tokens.js (CommonJS single source of truth).
// `any` 금지 — Hard Threshold. 토큰 구조를 명시적으로 선언한다.

export interface IInkPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface IThemeTokenSet {
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

declare const tokens: {
  palette: { ink: IInkPalette };
  light: IThemeTokenSet;
  dark: IThemeTokenSet;
};

export default tokens;
