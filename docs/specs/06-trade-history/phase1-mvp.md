---
feature: trade-history
phase: 1
title: MVP - 실거래 내역 조회
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - 실거래 내역 조회

> 매핑: F-002(실거래 리스트), F-012(데이터 출처 고지). US-201~US-203.
> 캐싱: 시군구×월 쿼리 키 공유 (`['trades', lawdCd, dealYmd]`) — 지역 리스트(F-008)와 동일 캐시 적중.

## Tasks

### 타입/스캐폴딩 [4a feature-builder]

- [x] `src/features/trade-history/types/index.ts` — 월 그룹 섹션, 로드 상태 타입
- [x] `src/features/trade-history/index.ts` — barrel export

### API/훅 [4b api-integrator]

- [x] `src/features/trade-history/api/trades.api.ts` — shared/api `getTrades` 경유 + entities/transaction 변환 래핑
- [x] `src/features/trade-history/api/index.ts` — barrel export
- [x] `src/features/trade-history/hooks/useMonthlyTrades.ts` — 시군구×월 useQuery (과거 월 Infinity / 당월·직전월 6h, 캐시 우선 + stale-while-revalidate, 실패 시 캐시 표시 + 비차단 안내)
- [x] `src/features/trade-history/hooks/useTradeHistory.ts` — aptKey(aptNm 정규화 매칭) 필터 + 최근 12개월 로드 + 과거 월 추가 로드 (최대 24개월)
- [x] `src/features/trade-history/hooks/index.ts` — barrel export

### UI [4c ui-developer]

- [x] `src/features/trade-history/ui/TransactionList.tsx` — FlashList 월 섹션 그룹핑 + 하단 도달 시 이전 월 추가 로드 + 0건 빈 상태
- [x] `src/features/trade-history/ui/TransactionItem.tsx` — 거래금액(억/만원)/전용면적(㎡+평 병기)/층/계약일/거래유형 표시
- [x] `src/features/trade-history/ui/CanceledBadge.tsx` — 해제 거래 뱃지 + 취소선 시각 구분
- [x] `src/features/trade-history/ui/DataSourceNotice.tsx` — "국토교통부 실거래 신고 기준" + 신고 지연(최대 30일) 안내 (F-012)
- [x] `src/features/trade-history/ui/index.ts` — barrel export

### Analytics 배선 [4d api-integrator]

- [x] `src/features/trade-history/hooks/useTradeHistory.ts` — `load_more_trades`(lawd_cd, month_depth) 배선 (수정)
- [x] `src/features/trade-history/api/trades.api.ts` — `fail_trade_fetch`(reason: timeout/server/parse/quota, lawd_cd) 최종 실패 배선 (수정)
  - 배선 위치 조정: `src/shared/api/molit/trades.api.ts`의 `getTrades` catch — feature 옵션뿐 아니라 `monthlyTradesQueryOptions`를 직접 쓰는 region-list/favorites/chart 경로까지 단일 chokepoint로 커버 (NETWORK=사용자 오프라인은 노이즈로 미발화, PARSE는 Crashlytics non-fatal 병행)

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [ ] 목 데이터로 리스트/뱃지/무한 로드 동작 확인
