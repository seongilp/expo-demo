---
feature: price-chart
phase: 1
title: MVP - 시세 추이/평형 비교 차트
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - 시세 추이/평형 비교 차트

> 매핑: F-003(월별 평균 추이), F-004(평형별 가격 비교). US-301~US-302.
> 차트 라이브러리는 design 단계 확정값 사용 — `features/price-chart` 내부에만 격리 (교체 가능성 확보).

## Tasks

### 타입/스캐폴딩 [4a feature-builder]

- [x] `package.json` — 차트 라이브러리 의존성 추가 (victory-native ^41 + @shopify/react-native-skia)
- [x] `src/features/price-chart/types/index.ts` — 차트 데이터 포인트/기간/면적 구간 타입
- [x] `src/features/price-chart/index.ts` — barrel export

### 훅 [4b api-integrator]

- [x] `src/features/price-chart/hooks/usePriceTrend.ts` — 12/24개월 월별 평균 추이 (entities/transaction 집계 셀렉터, 결측 월 처리)
- [x] `src/features/price-chart/hooks/useAreaComparison.ts` — 면적 구간 클러스터별 평균/최근 거래가 비교
- [x] `src/features/price-chart/hooks/index.ts` — barrel export

### UI [4c ui-developer]

- [x] `src/features/price-chart/ui/PriceTrendChart.tsx` — 라인 차트: 결측 월 포인트 생략(0 금지), 포인트 탭 툴팁(평균가/건수), 다크모드 테마 색상
- [x] `src/features/price-chart/ui/AreaCompareChart.tsx` — 평형별 비교 차트 (구간 선택 시 리스트 필터 연동, 1개 구간뿐이면 단일 요약)
- [x] `src/features/price-chart/ui/PeriodToggle.tsx` — 12/24개월 토글 (토글 시 햅틱)
- [x] `src/features/price-chart/ui/ChartEmptyState.tsx` — 데이터 2개월 미만 "거래가 부족합니다" 빈 상태
- [x] `src/features/price-chart/ui/index.ts` — barrel export

### Analytics 배선 [4d api-integrator]

- [x] `src/features/price-chart/ui/PeriodToggle.tsx` — `toggle_chart_period`(period_months) 배선 (수정)
- [x] `src/features/price-chart/ui/AreaCompareChart.tsx` — `select_area_group`(area_group) 배선 (수정, 선택 시에만 — 해제 미수집)

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [ ] 라이트/다크 모드 차트 렌더링 확인
