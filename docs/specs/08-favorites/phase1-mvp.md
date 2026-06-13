---
feature: favorites
phase: 1
title: MVP - 관심 단지 & 홈 화면
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - 관심 단지 & 홈 화면

> 매핑: F-005(관심 단지 저장 + 홈 카드). US-401~US-402. Retention 핵심 플로우(Flow B).
> 로컬 persist (AsyncStorage, 비민감) — 상한 20개. features 간 직접 참조 금지 → 조합은 widget에서.

## Tasks

### 스토어/타입 [4a feature-builder]

- [x] `src/features/favorites/store/favorites.store.ts` — 관심 단지 Zustand persist (상한 20, 초과 시 거부 + 사유 반환)
- [x] `src/features/favorites/types/index.ts` — `IFavoriteApartment` 타입 (+`TAddFavoriteResult` 사유 유니온)
- [x] `src/features/favorites/index.ts` — barrel export

### 훅 [4b api-integrator]

- [x] `src/features/favorites/hooks/useFavoriteToggle.ts` — 등록/해제 토글 + 햅틱 피드백 + 상한 초과 안내
- [x] `src/features/favorites/hooks/useFavoriteSummaries.ts` — 관심 단지별 최신 거래 요약 쿼리 (캐시 우선 표시 + 백그라운드 갱신)
- [x] `src/features/favorites/hooks/index.ts` — barrel export

### UI/위젯/스크린 [4c ui-developer]

- [x] `src/features/favorites/ui/FavoriteStarButton.tsx` — ★ 토글 버튼 (단지 상세 헤더용)
- [x] `src/features/favorites/ui/index.ts` — barrel export
- [x] `src/widgets/favorite-apt-card/ui/FavoriteAptCard.tsx` — 홈 카드: 단지명+지역+최신 거래(금액/면적/계약일), 길게 누르기 해제
- [x] `src/widgets/favorite-apt-card/index.ts` — barrel export
- [x] `app/(tabs)/index.tsx` — 홈 화면 재작성: 관심 단지 카드 목록, 0개 시 검색 유도 EmptyState + 최근 검색 바로가기, 등록/해제 즉시 반영

### Analytics 배선 [4d api-integrator]

- [x] `src/features/favorites/hooks/useFavoriteToggle.ts` — `add_favorite_apartment`/`remove_favorite_apartment`(lawd_cd, favorite_count) + `favorite_bucket` user property 배선 (수정)
- [x] `app/(tabs)/index.tsx` — `tap_favorite_card`(lawd_cd) 배선 + `useScreenTracking()` (수정, 최근 검색 칩 `tap_recent_search`도 배선)

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [ ] 등록→앱 재시작→유지 / 상한 20 초과 안내 동작 확인
