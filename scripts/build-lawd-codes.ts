// 법정동코드 전체자료 → 시군구(앞 5자리) JSON 번들 생성.
//
// 사용법:
//   1. code.go.kr > 법정동코드 전체자료 다운로드 (EUC-KR txt)
//   2. iconv -f euc-kr -t utf-8 법정동코드전체자료.txt > scripts/data/lawd-codes-raw.txt
//   3. npx tsx scripts/build-lawd-codes.ts [입력경로] [출력경로]
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

const DEFAULT_INPUT = path.resolve(__dirname, 'data/lawd-codes-raw.txt');
const DEFAULT_OUTPUT = path.resolve(__dirname, '../src/entities/region/data/lawd-codes.json');

/** 법정동코드 10자리 중 시군구 레벨(끝 5자리가 0, 시도 레벨 제외)만 추출 */
const isSigunguLevel = (code: string): boolean =>
  /^\d{10}$/.test(code) && code.endsWith('00000') && !code.endsWith('00000000');

const parseRawLine = (line: string): { lawdCd: string; fullName: string } | null => {
  const [code, name, status] = line.split('\t').map((part) => part?.trim() ?? '');
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
