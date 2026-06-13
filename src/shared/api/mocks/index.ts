// 목/실 API 스위치 — `EXPO_PUBLIC_USE_MOCK=true`면 목 XML을 반환한다.
// 목도 실 API와 동일한 XML 문자열을 거쳐 같은 파서/검증 경로를 타게 해
// 파싱 레이어를 선행 검증한다 (spec 합의 — 실 키 발급 전 전체 파이프라인 진행).
import { env } from '@/shared/config';
import { buildMockTradesXml, MOCK_QUOTA_EXCEEDED_XML } from './trades.mock';

export { buildMockTradesXml, MOCK_QUOTA_EXCEEDED_XML };

/** 목 데이터 사용 여부 — trades.api에서 분기 */
export const isMockEnabled = (): boolean => env.USE_MOCK;

/** 네트워크 지연 시뮬레이션을 포함한 목 XML 응답 */
export const fetchMockTradesXml = async (lawdCd: string, dealYmd: string): Promise<string> => {
  // 스켈레톤/로딩 UI 검증을 위한 가벼운 지연 (120~400ms)
  const delayMs = 120 + Math.floor(Math.random() * 280);
  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  return buildMockTradesXml(lawdCd, dealYmd);
};
