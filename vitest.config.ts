import path from 'node:path';
import { defineConfig } from 'vitest/config';

// FSD 경로 별칭 — tsconfig/babel과 동일하게 맞춰 entities 집계 로직 등
// 별칭 import가 있는 순수 모듈도 단위 테스트에서 해소되도록 한다.
// (entities 집계/변환은 @/shared/lib/format 같은 순수 leaf만 참조하므로
//  RN/Expo 네이티브 의존성을 transitively 끌어오지 않는다.)
const srcDir = path.resolve(__dirname, 'src');
const resolveSrc = (segment: string): string => path.join(srcDir, segment);

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolveSrc('core'),
      '@widgets': resolveSrc('widgets'),
      '@features': resolveSrc('features'),
      '@entities': resolveSrc('entities'),
      '@shared': resolveSrc('shared'),
      '@': srcDir,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules/**', '.expo/**', '.claude/**', '_workspace/**', 'plugins/**'],
  },
});
