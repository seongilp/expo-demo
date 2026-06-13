---
feature: favorites
phase: 2
title: Enhancement - 신규 거래 하이라이트 (v1.1)
status: not-started
created: 2026-06-13
updated: 2026-06-13
---

# Phase 2: Enhancement - 신규 거래 하이라이트 (v1.1)

> 매핑: F-104 — 홈 카드에서 마지막 확인 이후 신규 거래 "N건 NEW" 표시. 로컬 비교 기반 (푸시 아님 — spec: push=none). v1.1 범위.

## Tasks

### 스토어 [4a feature-builder]

- [ ] `src/features/favorites/store/favorites.store.ts` — 단지별 `lastSeenAt`/최근 확인 거래 기준 필드 확장 (수정)

### 훅 [4b api-integrator]

- [ ] `src/features/favorites/hooks/useNewTradeHighlight.ts` — 마지막 확인 이후 신규 거래 건수 로컬 비교 계산

### UI [4c ui-developer]

- [ ] `src/widgets/favorite-apt-card/ui/NewTradeBadge.tsx` — "N건 NEW" 뱃지
- [ ] `src/widgets/favorite-apt-card/ui/FavoriteAptCard.tsx` — 뱃지 연동 + 상세 진입 시 확인 처리 (수정)

### QA

- [ ] `npm run typecheck` 통과
- [ ] `npm run lint` 통과
