---
feature: data-layer
phase: 1
title: MVP - 공공 API 데이터 레이어 (shared/api)
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - 공공 API 데이터 레이어 (shared/api)

> 매핑: F-002 인프라, 리스크 R-1~R-4. 국토부 실거래 API(XML) 직접 호출 + fast-xml-parser/Zod 검증 + 목 데이터 선행 + TanStack Query persist.

## Tasks

### API 클라이언트/파서 [4b api-integrator]

- [x] `package.json` — `fast-xml-parser` 의존성 추가
- [x] `src/shared/api/client.ts` — Axios 인스턴스 교체: data.go.kr base URL, timeout 10s, 재시도 1회(백오프), serviceKey 주입 (R-1: base URL 교체만으로 프록시 전환 가능하게 추상화)
- [x] `src/shared/api/molit/schemas.ts` — 실거래 응답 Zod 스키마 (시스템 경계 검증, R-4)
- [x] `src/shared/api/molit/parser.ts` — fast-xml-parser 기반 XML→객체 파싱 + 정규화(거래금액 콤마 제거, 면적 number 변환)
- [x] `src/shared/api/molit/trades.api.ts` — `getTrades(lawdCd, dealYmd)` 매매 실거래 조회 함수
- [x] `src/shared/api/molit/index.ts` — barrel export

### 목 데이터 [4b api-integrator]

- [x] `src/shared/api/mocks/trades.mock.ts` — 실제 API XML 응답 스키마와 필드 단위 동일한 목 데이터 (해제 거래/직거래/콤마 금액 포함 — 파서 선행 검증용)
- [x] `src/shared/api/mocks/index.ts` — `EXPO_PUBLIC_USE_MOCK` 플래그 기반 목/실 API 스위치

### Query 설정 [4b api-integrator]

- [x] `src/shared/api/query/query-client.ts` — QueryClient 설정 + AsyncStorage persist (과거 월 장기 캐시)
- [x] `src/shared/api/query/keys.ts` — 캐시 키 팩토리 `['trades', lawdCd, dealYmd]` + staleTime 정책 (과거 월 Infinity / 당월·직전월 6h)
- [x] `src/shared/api/query/index.ts` — barrel export
- [x] `src/shared/api/index.ts` — barrel export 갱신
- [x] `src/core/providers/QueryProvider.tsx` — persist QueryClient 연동 수정

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [x] 목 데이터로 `getTrades` 파싱/검증 동작 확인 (vitest 단위 테스트)
