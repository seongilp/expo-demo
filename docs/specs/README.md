# Spec Dashboard — 집값노트 (jipgap-note)

> Phase 2.5 (Spec Planning) 산출물 — spec-planner (2026-06-13)
> 기준 문서: `_workspace/spec.md`, `_workspace/plan/prd.md`, `_workspace/plan/fsd-module-map.md`, `_workspace/plan/user-stories.md`, `_workspace/plan/kpis.md`
>
> **구현 에이전트 규칙**: task 완료 시 `- [ ]` → `- [x]` 변경, phase 전체 완료 시 frontmatter `status: completed`, 본 대시보드 진행률 갱신.
>
> **spec 확정 제외 사항**: store-review 모듈 없음(`store_review=false`) / 인증·푸시·IAP 없음(게스트 전용) / 광고는 Adaptive Banner 단일.

## 진행 현황

상태: 🔴 not started · 🟡 in-progress · 🟢 completed

| # | Feature | 매핑 기능 | Phase 1 (MVP) | Phase 2 (v1.1) | Status |
|---|---------|----------|---------------|----------------|--------|
| 01 | foundation | F-009, F-013, 템플릿 정리 | 🟡 24/27 | - | in-progress (4c 완료) |
| 02 | data-layer | F-002 인프라, R-1~R-4 | 🟡 13/16 | - | in-progress (4b 완료) |
| 03 | analytics | F-011 | 🟡 12/15 | - | in-progress (4d 완료) |
| 04 | entities | F-001/005/008 도메인 | 🟡 20/23 | 🔴 0/6 (F-102) | in-progress (4a 완료) |
| 05 | search | F-001, F-006, F-008 | 🟡 14/17 | - | in-progress (4d 완료) |
| 06 | trade-history | F-002, F-012 | 🟡 14/17 | 🔴 0/8 (F-101) | in-progress (4d 완료) |
| 07 | price-chart | F-003, F-004 | 🟡 13/16 | - | in-progress (4d 완료) |
| 08 | favorites | F-005 | 🟡 13/16 | 🔴 0/6 (F-104) | in-progress (4d 완료) |
| 09 | apartment-detail | F-002~F-005, F-012 조합 | 🟡 6/9 | - | in-progress (4d 완료) |
| 10 | nearby | F-007 | 🟡 10/13 | - | in-progress (4d 완료) |
| 11 | settings | F-009, F-014 | 🟡 14/17 | - | in-progress (4d 완료) |
| 12 | ads | F-010 | 🟡 16/20 | - | in-progress (4d 완료) |

**전체 진행률**: 169/226 (MVP Phase 1: 169/206 · Phase 2 v1.1: 0/20) — Phase 4a [4a] 60/60 + Phase 4b(api-integrator) [4b] 37/37 + Phase 4c(ui-developer) [4c] 45/45 + Phase 4d(api-integrator) [4d] 27/27 완료 (2026-06-13)

> Phase 4d 보류 항목 (사용자 콘솔 등록 후 수행): Firebase 콘솔 앱 등록 → `firebase/` 설정 파일 배치 → EAS Secrets → prebuild 빌드 검증.
> 절차: `_workspace/implementation/firebase-manual.md`. 코드(JS)는 미설정 시 안전 no-op — typecheck/lint/Expo Go 동작에 영향 없음.

## 단계별 Task 분포 (Phase 4 구현 순서)

| 단계 | 담당 에이전트 | 소관 | Phase 1 | Phase 2 | 계 |
|------|--------------|------|---------|---------|-----|
| 4a | feature-builder | FSD 스캐폴딩 / entities / types / store / 템플릿 정리 | 60 | 2 | 62 |
| 4b | api-integrator | api / hooks / shared-api / 권한·동의 인프라 | 37 | 6 | 43 |
| 4c | ui-developer | app/ 스크린 / widgets / ui 컴포넌트 | 45 | 6 | 51 |
| 4d | api-integrator | Analytics 인프라 + KPI 이벤트 배선 | 27 | 0 | 27 |
| QA | qa-reviewer | typecheck / lint / 기능 확인 | 37 | 6 | 43 |
| **계** | | | **206** | **20** | **226** |

## 구현 순서 (의존성)

```
01-foundation ─→ 02-data-layer ─→ 04-entities ─→ 05-search ─┐
        │               │                                    ├─→ 09-apartment-detail ─→ 12-ads
        │               └────────→ 06-trade-history ─────────┤
        │                          07-price-chart ───────────┤
        │                          08-favorites ─────────────┘
        ├─→ 03-analytics (인프라 — 각 스펙의 [4d] 배선은 Phase 4d에서 일괄)
        ├─→ 10-nearby (05-search 이후)
        └─→ 11-settings
```

- 디렉토리 번호 = 구현 의존성 순서. shared 인프라(01~03) → entities(04) → features(05~08) → 조합 화면(09) → 부가 기능(10~11) → 광고 배치(12, 대상 화면 완성 후).
- 각 phase 파일의 `[4a]`/`[4b]`/`[4c]`/`[4d]` 섹션 태그는 Phase 4 파이프라인의 담당 단계를 의미한다. 같은 스펙 안에서도 단계 순서(4a→4b→4c→4d)를 지킨다.
- Phase 2 (v1.1) 파일은 MVP 출시 전 착수하지 않는다.
- F-103(지도 탐색)은 v1.2+ 백로그 — 스펙 미생성 (해당 버전 기획 시 추가).
