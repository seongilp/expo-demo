// 오픈소스 라이선스 고지 (US-502) — 주요 런타임 의존성 정적 목록.
// 전체 의존성 트리가 아니라 사용자 대면 핵심 라이브러리만 고지한다.
// 패키지 추가/제거 시 이 목록을 함께 갱신한다.

export interface IOpenSourceLicense {
  /** 패키지명 (package.json 기준) */
  name: string;
  /** SPDX 라이선스 식별자 */
  license: string;
}

/** 주요 런타임 의존성 — 알파벳 순 */
export const OPEN_SOURCE_LICENSES: readonly IOpenSourceLicense[] = [
  { name: '@gorhom/bottom-sheet', license: 'MIT' },
  { name: '@react-native-async-storage/async-storage', license: 'MIT' },
  { name: '@react-native-firebase/app', license: 'Apache-2.0' },
  { name: '@react-navigation/native', license: 'MIT' },
  { name: '@shopify/flash-list', license: 'MIT' },
  { name: '@shopify/react-native-skia', license: 'MIT' },
  { name: '@tanstack/react-query', license: 'MIT' },
  { name: 'axios', license: 'MIT' },
  { name: 'dayjs', license: 'MIT' },
  { name: 'expo', license: 'MIT' },
  { name: 'expo-router', license: 'MIT' },
  { name: 'fast-xml-parser', license: 'MIT' },
  { name: 'nativewind', license: 'MIT' },
  { name: 'react', license: 'MIT' },
  { name: 'react-native', license: 'MIT' },
  { name: 'react-native-gesture-handler', license: 'MIT' },
  { name: 'react-native-reanimated', license: 'MIT' },
  { name: 'react-native-safe-area-context', license: 'MIT' },
  { name: 'react-native-svg', license: 'MIT' },
  { name: 'react-native-toast-message', license: 'MIT' },
  { name: 'victory-native', license: 'MIT' },
  { name: 'zod', license: 'MIT' },
  { name: 'zustand', license: 'MIT' },
];
