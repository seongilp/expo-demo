// QueryClient + AsyncStorage persist 설정 (02-data-layer).
// 과거 월 실거래(불변 데이터)를 재시작 후에도 재사용해 공공 API 호출을
// 최소화한다 (R-2 쿼터 절약). 캐시는 비민감 공공 데이터 — AsyncStorage 허용.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { TRADES_GC_TIME_MS } from './keys';

/** persist 복원 허용 기간 — 30일 (gcTime과 동일) */
export const PERSIST_MAX_AGE_MS = TRADES_GC_TIME_MS;

/** 캐시 스키마 변경 시 이 값을 올려 구버전 persist를 무효화한다 */
const PERSIST_BUSTER = 'trades-v1';

const PERSIST_STORAGE_KEY = 'jipgap-query-cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본값 — 실거래 쿼리는 monthlyTradesQueryOptions가 월별 정책으로 덮어쓴다
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: PERSIST_STORAGE_KEY,
  throttleTime: 2000,
});

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: queryPersister,
  maxAge: PERSIST_MAX_AGE_MS,
  buster: PERSIST_BUSTER,
  dehydrateOptions: {
    // 성공한 쿼리만 디스크에 저장 (로딩/에러 상태 복원 방지)
    shouldDehydrateQuery: (query) => query.state.status === 'success',
  },
};

/**
 * 조회 캐시 전체 초기화 — 메모리 + persist 동시 삭제 (11-settings F-014).
 * 관심 단지/최근 검색/테마 등 Zustand store는 건드리지 않는다.
 */
export const clearPersistedQueryCache = async (): Promise<void> => {
  queryClient.clear();
  await queryPersister.removeClient();
};
