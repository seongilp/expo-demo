// 공동주택 단지 목록 수집 → 단지 JSON 번들 생성.
//
// 소스: 공공데이터포털 "국토교통부_공동주택 단지 목록제공 서비스" (data.go.kr 15057332)
// 사용법:
//   MOLIT_API_KEY=<serviceKey> npx tsx scripts/build-apt-list.ts [출력경로]
//
// 출력 스키마: { lawdCd: string(5), aptNm: string, builtYear: number | null }[]
// 용량이 커지면 시도별 분할(scripts/data/apt-list-{sido}.json)을 검토한다 (fsd-module-map §5).
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

interface IAptRow {
  lawdCd: string;
  aptNm: string;
  builtYear: number | null;
}

interface ITotalAptListItem {
  kaptCode?: string;
  kaptName?: string;
  bjdCode?: string | number;
}

// _type=json 응답은 body.items 가 배열 자체이고, XML 변환 시에는 items.item 중첩이 된다.
// 두 형태를 모두 허용한다.
type TAptItemsNode =
  | ITotalAptListItem[]
  | { item?: ITotalAptListItem | ITotalAptListItem[] };

interface ITotalAptListResponse {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: TAptItemsNode;
      totalCount?: number;
    };
  };
}

/** body.items(배열) 또는 body.items.item(객체/배열) 모두에서 item 배열을 추출 */
const extractItems = (items: TAptItemsNode | undefined): ITotalAptListItem[] => {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  const inner = items.item;
  if (!inner) return [];
  return Array.isArray(inner) ? inner : [inner];
};

const BASE_URL = 'https://apis.data.go.kr/1613000/AptListService3/getTotalAptList3';
const PAGE_SIZE = 1000;
const DEFAULT_OUTPUT = path.resolve(__dirname, '../src/entities/apartment/data/apt-list.json');

const getServiceKey = (): string => {
  const key = process.env.MOLIT_API_KEY;
  if (!key) {
    throw new Error('MOLIT_API_KEY 환경변수가 필요합니다 (data.go.kr serviceKey).');
  }
  return key;
};

const fetchPage = async (serviceKey: string, pageNo: number): Promise<ITotalAptListResponse> => {
  const url = new URL(BASE_URL);
  url.searchParams.set('serviceKey', serviceKey);
  url.searchParams.set('pageNo', String(pageNo));
  url.searchParams.set('numOfRows', String(PAGE_SIZE));
  url.searchParams.set('_type', 'json');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API 응답 오류: HTTP ${response.status} (page ${pageNo})`);
  }
  return (await response.json()) as ITotalAptListResponse;
};

const toRows = (items: ITotalAptListItem[]): IAptRow[] =>
  items.reduce<IAptRow[]>((acc, item) => {
    const aptNm = item.kaptName?.trim();
    const bjdCode = String(item.bjdCode ?? '').trim();
    if (!aptNm || !/^\d{10}$/.test(bjdCode)) return acc;
    return [...acc, { lawdCd: bjdCode.slice(0, 5), aptNm, builtYear: null }];
  }, []);

const main = async (): Promise<void> => {
  const outputPath = process.argv[2] ?? DEFAULT_OUTPUT;
  const serviceKey = getServiceKey();

  const collected: IAptRow[] = [];
  let pageNo = 1;
  let totalCount = Number.POSITIVE_INFINITY;

  while ((pageNo - 1) * PAGE_SIZE < totalCount) {
    const data = await fetchPage(serviceKey, pageNo);
    const header = data.response?.header;
    const code = header?.resultCode ? String(header.resultCode).trim() : undefined;
    if (code && code !== '00' && code !== '000') {
      throw new Error(`API 오류 (${code}): ${header?.resultMsg ?? 'unknown'}`);
    }

    const body = data.response?.body;
    totalCount = body?.totalCount ?? 0;
    collected.push(...toRows(extractItems(body?.items)));

    console.log(`  page ${pageNo}: 누적 ${collected.length}/${totalCount}`);
    pageNo += 1;
  }

  // lawdCd + 단지명 기준 중복 제거
  const deduped = Array.from(
    new Map(collected.map((row) => [`${row.lawdCd}:${row.aptNm}`, row])).values(),
  ).sort((a, b) => a.lawdCd.localeCompare(b.lawdCd) || a.aptNm.localeCompare(b.aptNm));

  if (deduped.length === 0) {
    throw new Error('수집된 단지가 없습니다. serviceKey/API 상태를 확인하세요.');
  }

  await writeFile(outputPath, `${JSON.stringify(deduped, null, 2)}\n`, 'utf-8');
  console.log(`✔ ${deduped.length}개 단지 → ${outputPath}`);

  const sizeMb = Buffer.byteLength(JSON.stringify(deduped)) / 1024 / 1024;
  if (sizeMb > 2) {
    console.warn(`⚠ 번들 크기 ${sizeMb.toFixed(1)}MB — 시도별 분할/지연 로드 검토 필요`);
  }
};

main().catch((error: unknown) => {
  console.error('빌드 실패:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
