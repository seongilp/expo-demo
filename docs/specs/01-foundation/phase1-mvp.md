---
feature: foundation
phase: 1
title: MVP - 공용 인프라 & 템플릿 정리
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - 공용 인프라 & 템플릿 정리

> 매핑: F-009(테마 토큰), F-013(햅틱), 전 화면 공용 UI. spec 확정에 따라 템플릿의 auth/user/store-review 모듈을 제거한다 (게스트 전용, store_review=false).

## Tasks

### 템플릿 정리 [4a feature-builder]

- [x] `src/features/auth/` — 디렉토리 삭제 (게스트 전용 — 인증 기능 없음)
- [x] `src/entities/user/` — 디렉토리 삭제 (유저 도메인 불필요)
- [x] `src/shared/store-review/` — 디렉토리 삭제 (spec `store_review=false` — 모듈 잔존 금지)
- [x] `app/(auth)/` — 라우트 그룹 삭제 (로그인/회원가입 화면 제거)
- [x] `app/(tabs)/profile.tsx` — 삭제 (프로필 화면 없음)
- [x] `app/(tabs)/explore.tsx` — 삭제 (검색 탭으로 대체)
- [x] `src/shared/api/client.ts` — 토큰 인터셉터/refresh 로직 제거 (인증 없음, 상세 교체는 02-data-layer)
- [x] `package.json` — `expo-store-review`, `expo-secure-store` 등 미사용 의존성 제거 (react-hook-form/@hookform/resolvers/i18n-js/lottie-react-native 포함, app.config.ts plugin 동반 제거)

### 공용 설정/유틸 [4a feature-builder]

- [x] `src/shared/config/env.ts` — env 스키마 갱신: `EXPO_PUBLIC_USE_MOCK`, `EXPO_PUBLIC_MOLIT_API_KEY` 추가
- [x] `src/shared/config/theme.ts` — 집값노트 라이트/다크 테마 토큰 (design-architect 산출 반영 — theme-tokens.js 단일 소스 + theme-tokens.d.ts + tailwind.config.js §1.2 교체 + useThemeTokens 훅 포함)
- [x] `src/shared/lib/haptics.ts` — expo-haptics 래퍼 (F-013: 관심 토글/탭 전환/차트 토글 피드백)
- [x] `src/shared/lib/format/price.ts` — 거래금액 억/만원 포맷터 (콤마 문자열 → "12억 5,000")
- [x] `src/shared/lib/format/area.ts` — ㎡↔평 변환 및 병기 포맷터
- [x] `src/shared/lib/format/date.ts` — dayjs 기반 계약일/DEAL_YMD(YYYYMM) 유틸 (`toISOString().split` 금지)
- [x] `src/shared/lib/format/index.ts` — barrel export
- [x] `src/shared/lib/index.ts` — barrel export 갱신 (haptics, format)

### 공용 UI 컴포넌트 [4c ui-developer]

- [x] `src/shared/ui/SearchBar.tsx` — 검색 입력 공용 컴포넌트
- [x] `src/shared/ui/Badge.tsx` — 뱃지 (해제 거래/거래유형 등)
- [x] `src/shared/ui/Skeleton.tsx` — 로딩 스켈레톤
- [x] `src/shared/ui/EmptyState.tsx` — 빈 상태 (일러스트 + 메시지 + 액션)
- [x] `src/shared/ui/SegmentedControl.tsx` — 세그먼트 토글 (테마 3-way, 차트 기간 등)
- [x] `src/shared/ui/index.ts` — barrel export 갱신

### 내비게이션 골격 [4c ui-developer]

- [x] `app/_layout.tsx` — 루트 레이아웃 재구성: 테마 Provider + QueryClient 유지, auth 가드 제거 (analytics/ads 초기화는 03/12 스펙에서)
- [x] `app/(tabs)/_layout.tsx` — 하단 탭 3개(홈/검색/설정) 재구성, SafeArea 준수

### QA

- [x] `npm run typecheck` 통과 (삭제 모듈 참조 잔존 0)
- [x] `npm run lint` 통과
- [ ] 탭 3개 전환 동작 확인
