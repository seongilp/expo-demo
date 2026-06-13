// 집값노트 — 웜 페이퍼 에디토리얼 테마 (design/nativewind-theme.md §1.2)
// 색상 단일 소스: src/shared/config/theme-tokens.js (hex 중복 기입 금지)
const { palette, light, dark } = require('./src/shared/config/theme-tokens');

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: palette.ink, // primary-50 ~ primary-900

        // 시맨틱 토큰 — light 값 기본, dark는 `dark:` variant로 -dark 토큰 사용
        background: light.background,
        'background-dark': dark.background,
        surface: light.surface,
        'surface-dark': dark.surface,
        raised: light.surfaceRaised,
        'raised-dark': dark.surfaceRaised,
        field: light.field,
        'field-dark': dark.field,
        line: light.line,
        'line-dark': dark.line,
        'line-strong': light.lineStrong,
        'line-strong-dark': dark.lineStrong,

        ink: light.textPrimary,
        'ink-dark': dark.textPrimary,
        sub: light.textSecondary,
        'sub-dark': dark.textSecondary,
        faint: light.textTertiary,
        'faint-dark': dark.textTertiary,
        inverse: light.textInverse,
        'inverse-dark': dark.textInverse,

        up: light.priceUp,
        'up-dark': dark.priceUp,
        down: light.priceDown,
        'down-dark': dark.priceDown,
        danger: light.danger,
        'danger-dark': dark.danger,
        'danger-soft': light.dangerSoft,
        'danger-soft-dark': dark.dangerSoft,
        warning: light.warning,
        'warning-dark': dark.warning,
        'warning-soft': light.warningSoft,
        'warning-soft-dark': dark.warningSoft,
        skeleton: light.skeleton,
        'skeleton-dark': dark.skeleton,
      },
      fontFamily: {
        sans: ['Pretendard', 'System', 'sans-serif'],
      },
      fontSize: {
        display: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h1: ['24px', { lineHeight: '32px', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h3: ['17px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['15px', { lineHeight: '22px' }],
        caption: ['13px', { lineHeight: '18px' }],
        micro: ['11px', { lineHeight: '14px', fontWeight: '500' }],
        'price-lg': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'price-md': ['17px', { lineHeight: '24px', fontWeight: '700' }],
      },
      spacing: {
        13: '52px', // 버튼 lg 높이
        18: '72px', // 리스트 행 (2줄)
        banner: '64px', // Adaptive Banner reserve 영역 상한
      },
      borderRadius: {
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(31, 27, 22, 0.06)', // 유일한 그림자 단계
      },
    },
  },
  plugins: [],
};
