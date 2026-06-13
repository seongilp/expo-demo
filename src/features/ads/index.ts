// 배너 단일 포맷 (spec monetization.ad_formats=[banner]).
// 전면/리워드/앱오픈/프리미엄 관련 훅·store는 12-ads [4a]에서 제거됨.
// 동의 시퀀스는 initializeAdsWithConsent() 단일 진입점 — AdsConsent.*/
// mobileAds().initialize() 직접 호출 금지 (CLAUDE.md MANDATORY).
export { AdBanner } from './ui';
export { initializeAdsWithConsent, isAdsReady, onAdsReady, showAdsConsentForm } from './lib/consent';
export type { IAdConsentResult } from './lib/consent';
export { useAdGuardStore } from './store';
