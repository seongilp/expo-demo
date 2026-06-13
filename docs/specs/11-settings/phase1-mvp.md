---
feature: settings
phase: 1
title: MVP - 설정 & 다크 모드
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - 설정 & 다크 모드

> 매핑: F-009(다크 모드 — 시스템/라이트/다크 3-way), F-014(설정 화면). US-501~US-502.
> 캐시 초기화는 조회 캐시만 삭제 — 관심 단지/최근 검색은 유지 (별도 안내).

## Tasks

### 스토어/타입 [4a feature-builder]

- [x] `src/features/settings/store/theme.store.ts` — 테마 모드(system/light/dark) Zustand persist (기본값 system, NativeWind colorScheme.set 연동)
- [x] `src/features/settings/types/index.ts` — `EThemeMode` 등 타입
- [x] `src/features/settings/index.ts` — barrel export

### 로직 [4b api-integrator]

- [x] `src/features/settings/lib/clear-cache.ts` — TanStack Query 캐시 + persist 초기화 (관심 단지/최근 검색/테마 store는 제외)
- [x] `src/features/settings/lib/index.ts` — barrel export

### UI/스크린 [4c ui-developer]

- [x] `src/core/providers/ThemeProvider.tsx` — theme.store 연동 3-way 해석(system → useColorScheme) 수정, 전 화면 즉시 반응
- [x] `src/features/settings/ui/ThemeSelector.tsx` — SegmentedControl 기반 3-way 선택
- [x] `src/features/settings/ui/SettingsRow.tsx` — 설정 행 공용 컴포넌트 (링크/액션)
- [x] `src/features/settings/ui/CacheClearRow.tsx` — 캐시 초기화 행 + 확인 다이얼로그 + "관심 단지는 유지" 안내
- [x] `src/features/settings/ui/index.ts` — barrel export
- [x] `app/(tabs)/settings.tsx` — 설정 화면: 테마, 데이터 출처 고지, 개인정보처리방침 링크, 오픈소스 라이선스, 앱 버전, 캐시 초기화

### Analytics 배선 [4d api-integrator]

- [x] `src/features/settings/ui/ThemeSelector.tsx` — `toggle_dark_mode`(mode) + `theme_mode` user property 배선 (수정)
- [x] `src/features/settings/ui/CacheClearRow.tsx` — `clear_query_cache` 배선 (수정, 성공 시에만 — 에러 경로 미발화)
- [x] `app/(tabs)/settings.tsx` — `useScreenTracking()` (수정)

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [ ] 테마 전환 즉시 반영(차트/배너 영역 포함) + 재시작 유지 확인
