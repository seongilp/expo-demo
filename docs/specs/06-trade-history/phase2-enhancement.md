---
feature: trade-history
phase: 2
title: Enhancement - 전월세 실거래 탭 (v1.1)
status: not-started
created: 2026-06-13
updated: 2026-06-13
---

# Phase 2: Enhancement - 전월세 실거래 탭 (v1.1)

> 매핑: F-101 (API 15126474 — 보증금/월세/갱신요구권). 매매와 동일 쿼리 패턴. v1.1 범위.

## Tasks

### API/훅 [4b api-integrator]

- [ ] `src/shared/api/molit/rent.api.ts` — 전월세 실거래 조회 + Zod 스키마 + 파싱
- [ ] `src/entities/transaction/types/index.ts` — `IRentTransaction`(보증금/월세/갱신요구권) 타입 확장
- [ ] `src/features/trade-history/hooks/useRentHistory.ts` — 전월세 쿼리 훅 (매매와 동일 캐싱 정책)

### UI [4c ui-developer]

- [ ] `src/features/trade-history/ui/TradeTypeSegment.tsx` — 단지 상세 내 매매/전월세 세그먼트 토글
- [ ] `src/features/trade-history/ui/RentTransactionItem.tsx` — 보증금/월세 행 표시
- [ ] `app/apartment/[aptKey].tsx` — 세그먼트 연결 (수정)

### QA

- [ ] `npm run typecheck` 통과
- [ ] `npm run lint` 통과
