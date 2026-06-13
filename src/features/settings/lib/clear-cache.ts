// 조회 캐시 초기화 (F-014) — TanStack Query 메모리 캐시 + AsyncStorage persist 동시 삭제.
// 관심 단지(favorites-store)/최근 검색(recent-search-store)/테마(theme-store)는
// 별도 Zustand persist 키 — 이 함수가 절대 건드리지 않는다 ("관심 단지는 유지" 안내 근거).
import { clearPersistedQueryCache } from '@/shared/api';

export const clearQueryCache = async (): Promise<void> => {
  try {
    await clearPersistedQueryCache();
  } catch (error) {
    // 호출자(UI)가 토스트로 안내할 수 있도록 컨텍스트를 붙여 재throw
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`조회 캐시 초기화에 실패했습니다: ${detail}`);
  }
};
