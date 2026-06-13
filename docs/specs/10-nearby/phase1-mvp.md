---
feature: nearby
phase: 1
title: MVP - 내 주변 시세
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - 내 주변 시세

> 매핑: F-007. US-104. 위치 권한 optional — 거부해도 전 기능 사용 가능 (기능 차단/재요청 반복 금지).
> 좌표는 시군구 코드 변환 즉시 폐기 — 저장/전송/Analytics 로깅 금지 (lawd_cd 수준만 허용).

## Tasks

### 라이브러리/스캐폴딩 [4a feature-builder]

- [x] `package.json` — `expo-location` 의존성 추가
- [x] `src/features/nearby/lib/reverse-region.ts` — 좌표→시군구 역매핑 (entities/region 테이블 활용, 좌표 즉시 폐기)
- [x] `src/features/nearby/index.ts` — barrel export

### 훅/권한 [4b api-integrator]

- [x] `app.config.ts` — iOS `NSLocationWhenInUseUsageDescription` 문구 + Android 위치 권한 설정 (수정)
- [x] `src/features/nearby/hooks/useNearbyRegion.ts` — 권한 요청(최초 1회) → 허용: 좌표→lawdCd 변환 / 거부: 토스트 안내 fallback / blocked: 설정 앱 이동 안내
- [x] `src/features/nearby/hooks/index.ts` — barrel export

### UI [4c ui-developer]

- [x] `src/features/nearby/ui/NearbyButton.tsx` — "내 주변" 버튼 (성공 시 `region/[lawdCd]` 이동)
- [x] `src/features/nearby/ui/index.ts` — barrel export
- [x] `app/(tabs)/search.tsx` — 검색 화면에 NearbyButton 연결 (수정)

### Analytics 배선 [4d api-integrator]

- [x] `src/features/nearby/hooks/useNearbyRegion.ts` — `use_nearby_search`(permission_result: granted/denied/blocked, lawd_cd는 granted 시만) 배선 — 좌표/주소 문자열 전송 금지 (수정, NearbyButton push에 entry=nearby 추가 — 상세 entry_point 귀속)

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [ ] 권한 허용/거부/다시 묻지 않음 3개 경로 동작 확인
