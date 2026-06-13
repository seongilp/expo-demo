// 실거래 목 데이터 — 실제 국토부 API(RTMSDataSvcAptTrade) XML 응답과 필드 단위 동일 (R-4 파서 선행 검증용).
// 포함 케이스: 해제 거래(cdealType 'O' + cdealDay) / 직거래(dealingGbn) / 콤마+선행 공백 거래금액.
// lawdCd×dealYmd 시드 기반 결정적 생성 — 같은 파라미터는 항상 같은 응답 (캐시/차트 검증 안정성).
// 단지명은 entities/apartment 번들 샘플과 일치시켜 자동완성→상세 플로우가 목으로도 이어지게 한다.

interface IMockAptSeed {
  aptNm: string;
  umdNm: string;
  buildYear: number;
  /** 기준가 (만원) — 월별 변동의 중심값 */
  baseAmount: number;
  /** 대표 전용면적 목록 (㎡) — 평형 비교 차트 검증용 */
  areas: number[];
}

const DEFAULT_SEEDS: IMockAptSeed[] = [
  { aptNm: '중앙하이츠', umdNm: '중앙동', buildYear: 2004, baseAmount: 52_000, areas: [59.98, 84.97] },
  { aptNm: '시민공원더샵', umdNm: '시민동', buildYear: 2016, baseAmount: 78_000, areas: [74.89, 84.92] },
  { aptNm: '강변두산위브', umdNm: '강변동', buildYear: 2009, baseAmount: 64_500, areas: [59.92, 84.95, 114.7] },
];

/** 번들 단지(apt-list.json 샘플)와 표기 일치 — 검색→상세 목 플로우 연결 */
const SEEDS_BY_LAWD_CD: Record<string, IMockAptSeed[]> = {
  '11680': [
    { aptNm: '래미안대치팰리스', umdNm: '대치동', buildYear: 2015, baseAmount: 320_000, areas: [84.97, 94.5] },
    { aptNm: '은마', umdNm: '대치동', buildYear: 1979, baseAmount: 245_000, areas: [76.79, 84.43] },
    { aptNm: '도곡렉슬', umdNm: '도곡동', buildYear: 2006, baseAmount: 280_000, areas: [59.98, 84.99, 114.99] },
  ],
  '11650': [
    { aptNm: '반포자이', umdNm: '반포동', buildYear: 2009, baseAmount: 330_000, areas: [59.98, 84.94] },
    { aptNm: '래미안퍼스티지', umdNm: '반포동', buildYear: 2009, baseAmount: 350_000, areas: [59.96, 84.93, 117.78] },
    { aptNm: '아크로리버파크', umdNm: '반포동', buildYear: 2016, baseAmount: 390_000, areas: [59.95, 84.97] },
  ],
  '11710': [
    { aptNm: '헬리오시티', umdNm: '가락동', buildYear: 2018, baseAmount: 195_000, areas: [59.96, 84.98] },
    { aptNm: '잠실엘스', umdNm: '잠실동', buildYear: 2008, baseAmount: 230_000, areas: [59.96, 84.8, 119.93] },
    { aptNm: '리센츠', umdNm: '잠실동', buildYear: 2008, baseAmount: 225_000, areas: [27.68, 84.99] },
  ],
};

/** 문자열 시드 → 32bit 해시 (FNV-1a) — 결정적 의사난수의 출발점 */
const hashSeed = (seed: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/** mulberry32 — 시드 기반 결정적 의사난수 생성기 */
const createRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const formatWithComma = (amountManwon: number): string =>
  Math.round(amountManwon).toLocaleString('en-US');

interface IMockTradeRow {
  aptNm: string;
  dealAmount: string;
  excluUseAr: string;
  dealYear: string;
  dealMonth: string;
  dealDay: string;
  floor: string;
  buildYear: string;
  umdNm: string;
  jibun: string;
  dealingGbn: string;
  cdealType: string;
  cdealDay: string;
}

const buildRows = (lawdCd: string, dealYmd: string): IMockTradeRow[] => {
  const random = createRandom(hashSeed(`${lawdCd}:${dealYmd}`));
  const seeds = SEEDS_BY_LAWD_CD[lawdCd] ?? DEFAULT_SEEDS;
  const year = dealYmd.slice(0, 4);
  const month = String(Number(dealYmd.slice(4, 6)));
  const count = 6 + Math.floor(random() * 9); // 월 6~14건

  return Array.from({ length: count }, (_, index) => {
    const apt = seeds[Math.floor(random() * seeds.length)];
    const area = apt.areas[Math.floor(random() * apt.areas.length)];
    // 면적 비례 + ±8% 변동 — 월/단지별 자연스러운 가격 분포
    const areaFactor = area / apt.areas[apt.areas.length - 1];
    const amount = apt.baseAmount * areaFactor * (0.92 + random() * 0.16);
    const day = 1 + Math.floor(random() * 28);
    const isCanceled = index === 2 && random() < 0.7; // 해제 거래 케이스 보장적 포함
    const isDirect = index === 1; // 직거래 케이스 포함

    return {
      aptNm: apt.aptNm,
      // 실제 응답처럼 선행 공백 + 콤마 포함 (파서/정규화 검증 포인트)
      dealAmount: `    ${formatWithComma(amount)}`,
      excluUseAr: String(area),
      dealYear: year,
      dealMonth: month,
      dealDay: String(day),
      floor: String(1 + Math.floor(random() * 24)),
      buildYear: String(apt.buildYear),
      umdNm: apt.umdNm,
      jibun: String(100 + Math.floor(random() * 900)),
      dealingGbn: isDirect ? '직거래' : '중개거래',
      cdealType: isCanceled ? 'O' : '',
      cdealDay: isCanceled ? `${year}.${month}.${Math.min(day + 3, 28)}` : '',
    };
  });
};

const toItemXml = (row: IMockTradeRow): string =>
  [
    '      <item>',
    `        <aptNm>${row.aptNm}</aptNm>`,
    `        <dealAmount>${row.dealAmount}</dealAmount>`,
    `        <excluUseAr>${row.excluUseAr}</excluUseAr>`,
    `        <dealYear>${row.dealYear}</dealYear>`,
    `        <dealMonth>${row.dealMonth}</dealMonth>`,
    `        <dealDay>${row.dealDay}</dealDay>`,
    `        <floor>${row.floor}</floor>`,
    `        <buildYear>${row.buildYear}</buildYear>`,
    `        <umdNm>${row.umdNm}</umdNm>`,
    `        <jibun>${row.jibun}</jibun>`,
    `        <dealingGbn>${row.dealingGbn}</dealingGbn>`,
    `        <cdealType>${row.cdealType}</cdealType>`,
    `        <cdealDay>${row.cdealDay}</cdealDay>`,
    '      </item>',
  ].join('\n');

/**
 * 실 API와 동일 스키마의 목 XML 응답 생성 (결정적).
 * @param lawdCd 시군구 코드 5자리
 * @param dealYmd 계약 년월 YYYYMM
 */
export const buildMockTradesXml = (lawdCd: string, dealYmd: string): string => {
  const rows = buildRows(lawdCd, dealYmd);
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<response>',
    '  <header>',
    '    <resultCode>000</resultCode>',
    '    <resultMsg>OK</resultMsg>',
    '  </header>',
    '  <body>',
    '    <items>',
    rows.map(toItemXml).join('\n'),
    '    </items>',
    `    <numOfRows>${rows.length}</numOfRows>`,
    '    <pageNo>1</pageNo>',
    `    <totalCount>${rows.length}</totalCount>`,
    '  </body>',
    '</response>',
  ].join('\n');
};

/** 쿼터 초과 에러 envelope 목 — 에러 분류(quota_exceeded) 검증용 */
export const MOCK_QUOTA_EXCEEDED_XML = [
  '<OpenAPI_ServiceResponse>',
  '  <cmmMsgHeader>',
  '    <errMsg>SERVICE ERROR</errMsg>',
  '    <returnAuthMsg>LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR</returnAuthMsg>',
  '    <returnReasonCode>22</returnReasonCode>',
  '  </cmmMsgHeader>',
  '</OpenAPI_ServiceResponse>',
].join('\n');
