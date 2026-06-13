---
feature: entities
phase: 1
title: MVP - 도메인 엔티티 (region/apartment/transaction)
status: in-progress
created: 2026-06-13
updated: 2026-06-13
---

# Phase 1: MVP - 도메인 엔티티 (region/apartment/transaction)

> ⚠️ **배포 전 번들 데이터 전체 재생성 필수** (ISSUE-H2 / Fix Loop 1)
> 현재 번들(`apartment/data/apt-list.json` 38개 단지 · `region/data/lawd-codes.json` 177개 시군구)은
> 샘플 수준이라 실 API 모드에서 단지 자동완성/지역 검색 커버리지가 부족하다.
> 두 빌드 스크립트는 **외부 키·네트워크·수동 다운로드** 없이는 전체 데이터를 생성할 수 없으므로
> 코드 수정이 아닌 **배포 게이트**로 추적한다. 수행 절차는
> `_workspace/implementation/bundle-data-manual.md` 참고.

> 매핑: F-001/F-005/F-008 기반 데이터, F-002~F-004 도메인 모델. 빌드 타임 정적 번들 파이프라인 포함.
> 허용 예외: `entities/apartment → entities/region` (단지가 법정동에 종속 — fsd-module-map §4).

## Tasks

### 빌드 타임 데이터 파이프라인 [4a feature-builder]

- [x] `scripts/build-lawd-codes.ts` — code.go.kr 법정동코드 → 시군구(앞 5자리) ~250개 JSON 생성 스크립트
- [x] `scripts/build-apt-list.ts` — data.go.kr 15057332 공동주택 단지 목록 수집 스크립트 (용량 크면 시도별 분할)
- [x] `scripts/README.md` — 번들 갱신 절차 기록

### entities/region [4a feature-builder]

- [x] `src/entities/region/data/lawd-codes.json` — 법정동 시군구 정적 번들 (개발용 샘플 ~150개 — 출시 전 scripts로 전체 재생성, scripts/README.md 참고)
- [x] `src/entities/region/types/index.ts` — `IRegion`, `TLawdCd` 타입
- [x] `src/entities/region/lib/search-index.ts` — 지역명 검색 인덱스 (초성/부분 일치)
- [x] `src/entities/region/lib/region-map.ts` — 코드↔이름 매핑 + 좌표→시군구 역매핑 테이블 (시군구 중심 좌표)
- [x] `src/entities/region/lib/index.ts` — barrel export
- [x] `src/entities/region/index.ts` — barrel export

### entities/apartment [4a feature-builder]

- [x] `src/entities/apartment/data/apt-list.json` — 단지 목록 정적 번들 (개발용 샘플 — 출시 전 scripts로 전체 재생성. lib/apt-data.ts 타입 접근자 포함)
- [x] `src/entities/apartment/types/index.ts` — `IApartment`, `TAptKey` 타입
- [x] `src/entities/apartment/lib/apt-key.ts` — `aptKey`(`{lawdCd}:{aptNm}`) 합성/파싱
- [x] `src/entities/apartment/lib/normalize-name.ts` — aptNm 정규화 매칭 (공백/괄호 제거 등, R-5)
- [x] `src/entities/apartment/lib/index.ts` — barrel export
- [x] `src/entities/apartment/index.ts` — barrel export

### entities/transaction [4a feature-builder]

- [x] `src/entities/transaction/types/index.ts` — `ITransaction`, `ETradeType`(중개/직거래), `IMonthlyAverage`, `IAreaGroupStat` 타입 (+`IRawTradeItem` 파서 입력 타입)
- [x] `src/entities/transaction/lib/transform.ts` — 파싱된 API item → `ITransaction` 변환 (해제여부/거래유형 매핑)
- [x] `src/entities/transaction/lib/aggregate.ts` — 월별 평균가/평형(면적 구간)별 집계 셀렉터 (F-003/F-004 데이터 소스)
- [x] `src/entities/transaction/lib/index.ts` — barrel export
- [x] `src/entities/transaction/index.ts` — barrel export

### QA

- [x] `npm run typecheck` 통과
- [x] `npm run lint` 통과
- [ ] 집계/정규화 로직 vitest 단위 테스트 통과
