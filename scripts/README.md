# scripts/ — 빌드 타임 데이터 파이프라인

엔티티 정적 번들(`src/entities/*/data/*.json`)을 갱신하는 스크립트 모음.
일반 TS로 작성되며 lint/typecheck 대상에 포함된다. 실행은 `tsx` 사용.

## 번들 갱신 절차

### 1. 법정동 시군구 코드 (`entities/region/data/lawd-codes.json`)

소스: [code.go.kr](https://www.code.go.kr) > 법정동코드 전체자료 (EUC-KR txt)

```bash
# 1) 전체자료 다운로드 후 UTF-8 변환
iconv -f euc-kr -t utf-8 법정동코드전체자료.txt > scripts/data/lawd-codes-raw.txt

# 2) 시군구(법정동코드 앞 5자리) 레벨만 추출하여 JSON 생성 (~250개)
npx tsx scripts/build-lawd-codes.ts
```

- 폐지된 코드(`폐지여부 != 존재`)는 제외된다.
- **좌표(lat/lng)는 원본 자료에 없다.** 기존 번들의 수동 입력 좌표를 보존 병합하며,
  신규 시군구는 좌표 0으로 생성되고 경고가 출력된다 → 시군구청 중심 좌표를 수동 보정 후 커밋.
- 좌표는 `features/nearby`의 좌표→시군구 역매핑(`findNearestRegion`)에 사용된다.

### 2. 공동주택 단지 목록 (`entities/apartment/data/apt-list.json`)

소스: 공공데이터포털 [국토교통부_공동주택 단지 목록제공 서비스](https://www.data.go.kr/data/15057332/openapi.do)

```bash
MOLIT_API_KEY=<data.go.kr serviceKey> npx tsx scripts/build-apt-list.ts
```

- `kaptName` + `bjdCode`(앞 5자리 → lawdCd) 기준으로 수집/중복 제거.
- 번들이 2MB를 초과하면 경고 출력 → 시도별 분할/지연 로드 검토 (fsd-module-map §5, api-integrator 협의).

## 주의

- 현재 저장소의 두 JSON은 **개발용 샘플 번들**(주요 시군구 ~150개 / 대표 단지)이다.
  출시 전 위 절차로 전체 데이터를 재생성한다.
- 생성 결과는 반드시 `npm run typecheck && npm run test`로 검증 후 커밋한다.
