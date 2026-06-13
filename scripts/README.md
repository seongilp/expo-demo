# scripts/ — 빌드 타임 데이터 파이프라인

엔티티 정적 번들(`src/entities/*/data/*.json`)을 갱신하는 스크립트 모음.
일반 TS로 작성되며 lint/typecheck 대상에 포함된다. 실행은 `tsx` 사용.

## 번들 갱신 절차

### 1. 법정동 시군구 코드 (`entities/region/data/lawd-codes.json`)

**소스 (API 키 불필요, 공개 파일 다운로드):**
공공데이터포털 [국토교통부_법정동코드](https://www.data.go.kr/data/15123287/fileData.do) (data ID 15123287).
파일데이터이므로 **로그인/인증키 없이** 다운로드 가능하다.

- 기준일자: **2025-08-05** / 형식: **CSV(콤마 구분)** / 인코딩: **EUC-KR** / **49,861행**
- 최종 재생성: **2026-06-13** → 출력 `lawd-codes.json` **252개 시군구** (전국 17개 시·도 전부)

```bash
# 1) 공개 파일 직접 다운로드 (로그인 불필요).
#    atchFileId는 fileData.do 페이지 HTML의 `atchFileId=FILE_...`에서 확인 (갱신주기 연1회마다 변경 가능).
curl -L -A "Mozilla/5.0" \
  "https://www.data.go.kr/cmm/cmm/fileDownload.do?atchFileId=FILE_000000003205363&fileDetailSn=1&insertDataPrcus=N" \
  -o scripts/data/molit-lawd.bin

# 2) EUC-KR → UTF-8 변환
iconv -f euc-kr -t utf-8 scripts/data/molit-lawd.bin > scripts/data/lawd-codes-raw.csv

# 3) 시군구(법정동코드 앞 5자리) 레벨만 추출하여 JSON 생성 (~252개)
npx tsx scripts/build-lawd-codes.ts
```

> 대안 소스: [code.go.kr](https://www.code.go.kr) > 법정동코드 전체자료(EUC-KR **txt, 탭 구분**)도 동일 스키마로
> 사용 가능하다. 빌드 스크립트는 입력이 콤마(CSV)든 탭(TSV)이든 자동 인식한다.
> (`scripts/data/`는 `.gitignore` 대상 — 원본/변환 파일은 커밋하지 않고 위 절차로 재생성한다.)

- 폐지된 코드(`폐지여부 != 존재`)는 제외된다. 읍면동 10자리에서 시군구 5자리로 dedupe.
- 구(區)를 가진 시의 상위 코드는 제외하되, 상위 코드만 존재하는 시(예: `41590 화성시`)는 유지된다
  — 국토부 실거래가 API가 받는 LAWD_CD 단위와 일치시킨다.
- 2025-08-05 기준 데이터에는 강원특별자치도·전북특별자치도 개칭, 군위군(대구광역시 편입)이 반영돼 있다.
- **좌표(lat/lng)는 원본 자료에 없다.** 기존 번들의 수동 입력 좌표를 보존 병합하며(`loadExistingCoords`),
  신규 시군구는 좌표 0으로 생성되고 경고가 출력된다 → 시군구청 중심 좌표를 수동 보정 후 커밋.
- 좌표는 `features/nearby`의 좌표→시군구 역매핑(`findNearestRegion`)에 사용된다. 좌표 미보정(0,0) 시군구는
  적도 부근(아프리카 앞바다)에 위치해 한국 좌표의 최근접 후보가 될 수 없으므로 역매핑에서 자연 제외되며,
  지역명 검색에는 정상 노출된다(현재 252개 중 74개가 좌표 미보정 — "내 주변" 정확도 향상 위해 추후 보정 권장).

### 2. 공동주택 단지 목록 (`entities/apartment/data/apt-list.json`)

소스: 공공데이터포털 [국토교통부_공동주택 단지 목록제공 서비스](https://www.data.go.kr/data/15057332/openapi.do)

```bash
MOLIT_API_KEY=<data.go.kr serviceKey> npx tsx scripts/build-apt-list.ts
```

- `kaptName` + `bjdCode`(앞 5자리 → lawdCd) 기준으로 수집/중복 제거.
- 번들이 2MB를 초과하면 경고 출력 → 시도별 분할/지연 로드 검토 (fsd-module-map §5, api-integrator 협의).

## 주의

- `lawd-codes.json`은 **전국 252개 시군구 전체 데이터**로 재생성 완료(출처: 국토교통부 법정동코드 2025-08-05,
  재생성 2026-06-13). 좌표는 178/252만 보정된 상태 — 나머지는 "내 주변" 정확도 위해 추후 수동 보정.
- `apt-list.json`은 여전히 **개발용 샘플 번들**(대표 단지)이다. 전체 단지 마스터는 data.go.kr serviceKey가
  필요하므로([ISSUE-H2] 추적), 키 발급 후 위 2번 절차로 재생성한다.
- 생성 결과는 반드시 `npm run typecheck && npm run test`로 검증 후 커밋한다.
