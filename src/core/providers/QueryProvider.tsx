// TanStack Query Provider — AsyncStorage persist 연동 (02-data-layer).
// QueryClient/persister 정의는 src/shared/api/query/query-client.ts 단일 소스.
import React, { ReactNode } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persistOptions } from '@/shared/api';

interface IQueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: IQueryProviderProps): React.JSX.Element {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      {children}
    </PersistQueryClientProvider>
  );
}
