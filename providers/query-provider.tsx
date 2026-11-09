import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

type QueryProviderProps = {
  readonly children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            staleTime: 15_000,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
