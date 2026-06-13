// 법정동코드 전체자료 → 시군구(앞 5자리) JSON 번들 생성.
//
// 데이터 출처 (API 키 불필요, 공개 파일 다운로드):
//   공공데이터포털 "국토교통부_법정동코드" (data.go.kr/data/15123287/fileData.do)
//   - 기준일자: 2025-08-05 / 형식: CSV(콤마 구분) / 인코딩: EUC-KR / 49,861행
//   - 직접 다운로드(로그인 불필요):
//       curl -L -A "Mozilla/5.0" \
//         "https://www.data.go.kr/cmm/cmm/fileDownload.do?atchFileId=FILE_000000003205363&fileDetailSn=1&insertDataPrcus=N" \
//         -o scripts/data/molit-lawd.bin
//       iconv -f euc-kr -t utf-8 scripts/data/molit-lawd.bin > scripts/data/lawd-codes-raw.csv
//   (atchFileId는 갱신주기[연1회]마다 바뀔 수 있다. 바뀌면 위 fileData.do 페이지 HTML에서
//    `atchFileId=FILE_...` 값을 다시 확인한다.)
//   대안: code.go.kr > 법정동코드 전체자료(EUC-KR txt, 탭 구분)도 동일 스키마로 사용 가능.
//
// 사용법:
//   npx tsx scripts/build-lawd-codes.ts [입력경로] [출력경로]
//   (기본 입력: scripts/data/lawd-codes-raw.csv)
//
// 입력은 콤마(CSV) 또는 탭(TSV) 구분 모두 허용한다 — 컬럼: 법정동코드, 법정동명, 폐지여부.
// 폐지(말소) 코드는 제외하고 "존재"만 추출하며, 읍면동 10자리를 시군구 5자리로 dedupe 한다.
//
// 좌표(lat/lng)는 원본 자료에 없으므로 기존 번들의 수동 좌표를 보존 병합한다.
// 신규 시군구는 좌표 0으로 생성되며 경고 출력 — 수동 보정 후 커밋한다.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface IRegionRow {
  lawdCd: string;
  sido: string;
  sigungu: string;
  lat: number;
  lng: number;
}

const DEFAULT_INPUT = path.resolve(__dirname, 'data/lawd-codes-raw.csv');
const DEFAULT_OUTPUT = path.resolve(__dirname, '../src/entities/region/data/lawd-codes.json');

/** 법정동코드 10자리 중 시군구 레벨(끝 5자리가 0, 시도 레벨 제외)만 추출 */
const isSigunguLevel = (code: string): boolean =>
  /^\d{10}$/.test(code) && code.endsWith('00000') && !code.endsWith('00000000');

/** 한 행을 [코드, 명칭, 폐지여부] 3컬럼으로 분리 — 탭(TSV) 또는 콤마(CSV) 구분 모두 지원. */
const splitColumns = (line: string): string[] => {
  const parts = line.includes('\t') ? line.split('\t') : line.split(',');
  return parts.map((part) => part?.trim() ?? '');
};

const parseRawLine = (line: string): { lawdCd: string; fullName: string } | null => {
  const [code, name, status] = splitColumns(line);
  if (!code || !name || status !== '존재') return null;
  if (!isSigunguLevel(code)) return null;
  return { lawdCd: code.slice(0, 5), fullName: name };
};

const splitName = (fullName: string): { sido: string; sigungu: string } => {
  const parts = fullName.split(/\s+/);
  if (parts.length === 1) return { sido: parts[0], sigungu: parts[0] };
  // "경기도 수원시 장안구" → sido="경기도", sigungu="수원시 장안구"
  return { sido: parts[0], sigungu: parts.slice(1).join(' ') };
};

const loadExistingCoords = async (outputPath: string): Promise<Map<string, IRegionRow>> => {
  try {
    const raw = await readFile(outputPath, 'utf-8');
    const rows = JSON.parse(raw) as IRegionRow[];
    return new Map(rows.map((row) => [row.lawdCd, row]));
  } catch {
    return new Map();
  }
};

const main = async (): Promise<void> => {
  const inputPath = process.argv[2] ?? DEFAULT_INPUT;
  const outputPath = process.argv[3] ?? DEFAULT_OUTPUT;

  const raw = await readFile(inputPath, 'utf-8');
  const existing = await loadExistingCoords(outputPath);

  const seen = new Set<string>();
  const candidates: { lawdCd: string; fullName: string }[] = [];

  for (const line of raw.split('\n')) {
    const parsed = parseRawLine(line);
    if (!parsed || seen.has(parsed.lawdCd)) continue;
    seen.add(parsed.lawdCd);
    candidates.push(parsed);
  }

  // 구를 가진 시의 상위 코드(예: 41110 수원시)는 제외 — MOLIT API는 구 단위
  // LAWD_CD(41111 수원시 장안구 등)로만 데이터를 제공한다.
  const fullNames = candidates.map((candidate) => candidate.fullName);
  const isParentOfGu = (fullName: string): boolean =>
    fullNames.some((other) => other !== fullName && other.startsWith(`${fullName} `));

  const regions: IRegionRow[] = [];
  const missingCoords: string[] = [];

  for (const parsed of candidates) {
    if (isParentOfGu(parsed.fullName)) continue;

    const { sido, sigungu } = splitName(parsed.fullName);
    const prev = existing.get(parsed.lawdCd);
    const lat = prev?.lat ?? 0;
    const lng = prev?.lng ?? 0;
    if (lat === 0 || lng === 0) missingCoords.push(`${parsed.lawdCd} ${parsed.fullName}`);

    regions.push({ lawdCd: parsed.lawdCd, sido, sigungu, lat, lng });
  }

  if (regions.length === 0) {
    throw new Error(`시군구 레코드를 찾지 못했습니다. 입력 파일을 확인하세요: ${inputPath}`);
  }

  regions.sort((a, b) => a.lawdCd.localeCompare(b.lawdCd));
  await writeFile(outputPath, `${JSON.stringify(regions, null, 2)}\n`, 'utf-8');

  console.log(`✔ ${regions.length}개 시군구 → ${outputPath}`);
  if (missingCoords.length > 0) {
    console.warn(`⚠ 좌표 누락 ${missingCoords.length}건 — 수동 보정 필요:`);
    missingCoords.forEach((entry) => console.warn(`  - ${entry}`));
  }
};

main().catch((error: unknown) => {
  console.error('빌드 실패:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
