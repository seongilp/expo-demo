---
feature: apartment-detail
phase: 1
title: MVP - 단지 상세 화면 (조합)
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - 단지 상세 화면 (조합)

> 매핑: F-002~F-005, F-012 조합 화면. Activation 핵심 플로우(Flow A)의 종착지 — 추이 차트 + 평형 비교 + 실거래 리스트 + ★ 토글 동시 노출.
> features 간 직접 참조 금지 → `widgets/apt-detail-summary`에서 price-chart/trade-history/favorites 조합. 의존: 05~08 스펙 완료 후 착수.

## Tasks

### 위젯/스크린 [4c ui-developer]

- [x] `src/widgets/apt-detail-summary/ui/AptDetailSummary.tsx` — 상세 상단 블록: PriceTrendChart + PeriodToggle + AreaCompareChart + FavoriteStarButton 조합
- [x] `src/widgets/apt-detail-summary/index.ts` — barrel export
- [x] `app/apartment/[aptKey].tsx` — 단지 상세 화면: aptKey 파싱, 위젯 + TransactionList + DataSourceNotice, 스켈레톤 로딩/에러 재시도, SafeArea 준수 (배너 배치는 12-ads에서)
- [x] `app/apartment/[aptKey].tsx` — 상세 진입 시 최근 검색 자동 기록 배선 (recent-search.store, US-103)

### Analytics 배선 [4d api-integrator]

- [x] `app/apartment/[aptKey].tsx` — `view_apartment_detail`(lawd_cd, entry_point: search/region_list/nearby/favorite/recent, trade_count, from_cache) 배선 + `useScreenTracking()` (수정) — entry_point는 각 진입 화면이 push params(`entry`)로 전달, from_cache는 마운트 시 초기 12개월 쿼리 전부 캐시 적중 여부
- [x] `app/apartment/[aptKey].tsx` — `activation`(feature_id, elapsed_sec) 생애 최초 1회 발화 배선 — 로컬 플래그 persist (수정, `shared/analytics/activation.ts` — feature_id는 kpis 4종, entry 'recent'는 'search' 귀속)

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [ ] 검색→상세 3탭 도달 + 캐시 히트 시 즉시 렌더 확인
