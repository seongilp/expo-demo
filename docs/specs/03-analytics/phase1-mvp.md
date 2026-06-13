---
feature: analytics
phase: 1
title: MVP - Analytics/Crashlytics 인프라 (shared/analytics)
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - Analytics/Crashlytics 인프라 (shared/analytics)

> 매핑: F-011. 이벤트 카탈로그 기준: `_workspace/plan/kpis.md`. 기존 템플릿 래퍼(`src/shared/lib/analytics/`)를 FSD 표준 위치 `src/shared/analytics/`로 이전/재구성한다.
> 각 기능별 이벤트 "배선" task는 해당 기능 스펙(05~12)의 [4d] 섹션에 있다. 본 스펙은 인프라만 다룬다.

## Tasks

### 모듈 인프라 [4d api-integrator]

- [x] `src/shared/analytics/client.ts` — Firebase Analytics/Crashlytics 래퍼 (`logEvent`, `setUserProperty`, `recordNonFatal`) — 기존 `src/shared/lib/analytics/` 이전, dev 환경 수집 비활성/디버그 모드
- [x] `src/shared/analytics/events.ts` — kpis.md 커스텀 이벤트 카탈로그 상수 + 파라미터 타입 (`activation`, `search_region`, `search_apartment`, `view_apartment_detail`, `view_region_list`, `load_more_trades`, `toggle_chart_period`, `select_area_group`, `add_favorite_apartment`, `remove_favorite_apartment`, `tap_favorite_card`, `tap_recent_search`, `use_nearby_search`, `toggle_dark_mode`, `clear_query_cache`, `fail_trade_fetch`) — 매직 스트링 0
- [x] `src/shared/analytics/user-properties.ts` — `theme_mode`, `favorite_bucket`, `ump_status`, `ump_can_request_ads`, `att_status` 상수 + setter
- [x] `src/shared/analytics/hooks/useScreenTracking.ts` — 화면 진입 시 screen_view 자동 수집 훅
- [x] `src/shared/analytics/hooks/index.ts` — barrel export
- [x] `src/shared/analytics/types/index.ts` — IEventName, TEventParams 등 타입
- [x] `src/shared/analytics/index.ts` — barrel export
- [x] `src/shared/lib/analytics/` — 구 위치 삭제 + 참조 마이그레이션 (외부 참조 0 확인 후 삭제, activation.ts 추가)
- [x] `app/_layout.tsx` — `initAnalytics()` 호출 (수정): `setAnalyticsCollectionEnabled(IS_PROD)` + Crashlytics 활성화 (+ `recordFirstOpenAt()` — activation elapsed_sec 기준점)
- [x] `package.json` — `@react-native-firebase/crashlytics` 의존성 추가 (app/analytics는 기설치) — ^24.1.1
- [x] `app.config.ts` — `@react-native-firebase/crashlytics` plugin 등록 확인 (+ `./plugins/withRNFirebaseStaticBuild`, `forceStaticLinking`에 RNFBCrashlytics)
  - 보류: Firebase 콘솔 앱 등록/설정 파일 배치/EAS Secrets/prebuild 검증은 사용자 콘솔 등록 후 수행 — `_workspace/implementation/firebase-manual.md` 참조. 코드(JS)는 미설정 시 안전 no-op

### Crashlytics 비치명 리포트 [4d api-integrator]

- [x] `src/shared/api/molit/parser.ts` — XML 파싱 실패 시 Crashlytics non-fatal 리포트 배선 (수정, R-4)
  - 배선 위치 조정: parser.ts는 vitest node 환경에서 expo 의존 없이 실행돼야 하므로(parser.test.ts 계약) `trades.api.ts`의 `getTrades` catch(파싱 실패가 통과하는 유일한 chokepoint)에서 `recordNonFatal` + `fail_trade_fetch` 배선 — 커버리지 동일

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [x] 직접 `firebase.analytics()` 호출 0건 / PII·좌표 파라미터 0건 확인
