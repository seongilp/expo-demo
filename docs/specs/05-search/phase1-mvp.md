---
feature: search
phase: 1
title: MVP - 지역/단지 통합 검색
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - 지역/단지 통합 검색

> 매핑: F-001(통합 자동완성), F-006(최근 검색), F-008(지역 단지 리스트). US-101~US-103.
> 자동완성은 로컬 번들 기반 — 비행기 모드에서도 동작 (네트워크 불필요).

## Tasks

### 스토어/타입 [4a feature-builder]

- [x] `src/features/search/store/recent-search.store.ts` — 최근 검색 Zustand persist (AsyncStorage, 최대 10건, 중복 시 최상단 갱신, 개별/전체 삭제)
- [x] `src/features/search/types/index.ts` — `TSearchResult`(apartment/region 유니온), 자동완성 항목 타입
- [x] `src/features/search/index.ts` — barrel export

### 훅 [4b api-integrator]

- [x] `src/features/search/hooks/useAutocomplete.ts` — 단지명+법정동 통합 자동완성 (entities 로컬 인덱스, 2글자 이상, 300ms 이내)
- [x] `src/features/search/hooks/useRegionAptList.ts` — 지역 단지 리스트 (최근 3개월 실거래 응답 aptNm 그룹핑 + 로컬 번들 하이브리드, 최근 거래일 순)
- [x] `src/features/search/hooks/index.ts` — barrel export

### UI/스크린 [4c ui-developer]

- [x] `src/features/search/ui/AutocompleteList.tsx` — 자동완성 결과 (단지명+소속 시군구 병기, 0건 빈 상태 + 지역 검색 유도)
- [x] `src/features/search/ui/RecentSearchList.tsx` — 최근 검색 목록 (원탭 재조회, 개별 X/전체 삭제)
- [x] `src/features/search/ui/RegionAptListItem.tsx` — 지역 단지 행 (단지명/최근 거래가/거래 건수)
- [x] `src/features/search/ui/index.ts` — barrel export
- [x] `app/(tabs)/search.tsx` — 검색 화면: SearchBar + 자동완성 + 입력 전 최근 검색 노출 ("내 주변" 버튼은 10-nearby에서 연결)
- [x] `app/region/[lawdCd].tsx` — 지역 단지 리스트 화면: 스켈레톤 로딩 + 실패 시 재시도 버튼 (배너 배치는 12-ads에서)

### Analytics 배선 [4d api-integrator]

- [x] `app/(tabs)/search.tsx` — `search_region`/`search_apartment`(lawd_cd, query_length), `tap_recent_search`(entry_type) 이벤트 배선 + `useScreenTracking()`
- [x] `app/region/[lawdCd].tsx` — `view_region_list`(lawd_cd, apt_count) 이벤트 배선 + `useScreenTracking()`

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [ ] 검색 → 단지 상세 3탭 도달 / 비행기 모드 자동완성 동작 확인
