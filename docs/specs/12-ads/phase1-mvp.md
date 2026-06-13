---
feature: ads
phase: 1
title: MVP - Adaptive Banner 광고 (배너 단일)
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - Adaptive Banner 광고 (배너 단일)

> 매핑: F-010. US-601. spec 확정: **Adaptive Banner 단일 포맷** — 전면/리워드/앱오픈/IAP 없음 (어떤 형태로도 추가 금지).
> Placement: 단지 상세(`BANNER_APT_DETAIL`) + 지역 리스트(`BANNER_REGION_LIST`) 하단 anchored, 화면당 1개. 홈/검색/설정 배치 금지.
> 시퀀스: UMP → ATT → `setRequestConfiguration` → `initialize()` — `initializeAdsWithConsent()` 경유 필수.

## Tasks

### 템플릿 정리 — 배너 단일화 [4a feature-builder]

- [x] `src/features/ads/hooks/useInterstitialAd.ts` — 삭제 (전면 광고 미사용)
- [x] `src/features/ads/hooks/useRewardedAd.ts` — 삭제 (리워드 미사용)
- [x] `src/features/ads/hooks/useAppOpenAd.ts` — 삭제 (앱오픈 미사용)
- [x] `src/features/ads/hooks/usePremiumGuard.ts` — 삭제 (IAP/프리미엄 없음)
- [x] `src/features/ads/store/premium.store.ts` — 삭제 (IAP 없음)
- [x] `src/features/ads/hooks/index.ts` — barrel export 갱신 (삭제 반영 — 잔존 훅 없어 hooks/ 디렉토리 자체 제거. 전면/프리미엄 전용이던 useAdLifecycle/AdDevPanel/ad.store/types도 동반 삭제, 클릭 가드 store는 [4b]에서 ad-guard.store.ts로 재구축)
- [x] `src/features/ads/index.ts` — barrel export 갱신 (`initializeAdsWithConsent`, `AdBanner`만 노출 — fsd-module-map 기준 `isAdsReady`/`onAdsReady` 포함)

### 동의 시퀀스/가드 인프라 [4b api-integrator]

- [x] `src/features/ads/lib/consent.ts` — `initializeAdsWithConsent()` UMP→ATT→`setRequestConfiguration`(MaxAdContentRating.PG)→`initialize()` 순서 검증/정비 (수정)
- [x] `src/features/ads/store/ad-guard.store.ts` — 배너 클릭 가드 store: 일일 5회 초과 클릭 시 24h 배너 숨김 (기존 `ad.store.ts` 대체/정비)
- [x] `src/shared/config/ads.ts` — `AdUnitIds` 재정의: `BANNER_APT_DETAIL`/`BANNER_REGION_LIST` 2개 + dev/preview 테스트 ID 전환 + `testDeviceIdentifiers` (수정)
- [x] `app.config.ts` — `NSUserTrackingUsageDescription` + `react-native-google-mobile-ads` plugin 옵션 확인 (수정)
- [x] `app/_layout.tsx` — `initializeAdsWithConsent()` await 호출 확인 (직접 `mobileAds().initialize()` 금지) (수정)

### 배너 UI/배치 [4c ui-developer]

- [x] `src/features/ads/ui/AdBanner.tsx` — `ANCHORED_ADAPTIVE_BANNER`: 미로드 시 collapse(빈 영역 금지), 고정 높이 reserve로 레이아웃 시프트 방지, 클릭 가드 연동, 로드 실패 지수 백오프 (수정)
- [x] `app/apartment/[aptKey].tsx` — 하단 anchored 배너 배치 (Safe Area 위, 콘텐츠/터치 요소 이격) (수정)
- [x] `app/region/[lawdCd].tsx` — 하단 anchored 배너 배치 (수정)

### Analytics 배선 [4d api-integrator]

- [x] `src/features/ads/lib/consent.ts` — `ump_status`/`ump_can_request_ads`/`att_status` user property 배선 (수정, `setAdsConsentProperties` 래퍼 경유 — UMP 실패 시 'error', ATT unavailable→'not_applicable')

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [x] 홈/검색/설정 배너 0개 + 화면당 배너 1개 + 미로드 collapse 확인
- [x] `AdsConsent.*`/`mobileAds().initialize()` 직접 호출 0건 확인
