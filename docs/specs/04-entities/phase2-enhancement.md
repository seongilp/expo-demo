---
feature: entities
phase: 2
title: Enhancement - 단지 기본정보 (v1.1)
status: not-started
created: 2026-06-13
updated: 2026-06-13
---

# Phase 2: Enhancement - 단지 기본정보 (v1.1)

> 매핑: F-102 (kaptCode → 세대수/동수/주소, API 15058453). v1.1 범위 — MVP에서 착수하지 않는다.

## Tasks

### 도메인 확장 [4a feature-builder]

- [ ] `src/entities/apartment/types/index.ts` — `IApartmentInfo`(세대수/동수/주소/kaptCode) 타입 확장

### API [4b api-integrator]

- [ ] `src/shared/api/molit/apt-info.api.ts` — 공동주택 기본정보 조회 (API 15058453) + Zod 스키마
- [ ] `src/entities/apartment/lib/kapt-match.ts` — aptKey ↔ kaptCode 매칭 로직

### UI [4c ui-developer]

- [ ] `src/widgets/apt-detail-summary/ui/AptInfoRow.tsx` — 단지 상세 기본정보 표시 행

### QA

- [ ] `npm run typecheck` 통과
- [ ] `npm run lint` 통과
