// 집값노트 theme tokens — single source of truth (CommonJS).
// Consumed by tailwind.config.js (require) AND src/shared/config/theme.ts (typed re-export).
// 색상 hex는 이 파일에만 존재한다. 두 곳에 중복 기입 금지.
const palette = {
  ink: {
    50: '#EAF6F0',
    100: '#D0EBDF',
    200: '#A6D9C3',
    300: '#73C0A1',
    400: '#3FA57F',
    500: '#178F66',
    600: '#0F7252',
    700: '#0D5B43',
    800: '#0B4836',
    900: '#09392C',
  },
};

const light = {
  background: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceRaised: '#F3F0EA',
  field: '#F1EDE6',
  line: '#E8E3DA',
  lineStrong: '#D8D1C4',
  textPrimary: '#1F1B16',
  textSecondary: '#6B6356',
  textTertiary: '#9A9183',
  textInverse: '#FAF8F5',
  primary: palette.ink[600],
  primaryPressed: palette.ink[700],
  priceUp: '#D94F3D',
  priceDown: '#2D68C4',
  danger: '#C2362B',
  dangerSoft: '#FAE9E6',
  warning: '#8F6312',
  warningSoft: '#F6ECD9',
  chartLine: palette.ink[500],
  chartGrid: '#E8E3DA',
  chartCategorical: ['#178F66', '#C28A2D', '#2D68C4', '#8B5CA6', '#B3543F'],
  skeleton: '#EDE9E1',
};

const dark = {
  background: '#15130F',
  surface: '#1E1B16',
  surfaceRaised: '#28241D',
  field: '#28241D',
  line: '#332E26',
  lineStrong: '#443E33',
  textPrimary: '#F2EEE7',
  textSecondary: '#A89F90',
  textTertiary: '#756D5F',
  textInverse: '#15130F',
  primary: palette.ink[400],
  primaryPressed: palette.ink[300],
  priceUp: '#E8705F',
  priceDown: '#6E9BE8',
  danger: '#F08C7F',
  dangerSoft: '#3B2722',
  warning: '#D9A93E',
  warningSoft: '#383022',
  chartLine: palette.ink[400],
  chartGrid: '#332E26',
  chartCategorical: ['#3FA57F', '#D9A93E', '#6E9BE8', '#B388CC', '#D98873'],
  skeleton: '#2E2A22',
};

module.exports = { palette, light, dark };
