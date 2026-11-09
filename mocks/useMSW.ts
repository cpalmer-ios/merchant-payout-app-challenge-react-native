/**
 * Hook to initialize MSW in development mode.
 * Devices use the React Native server. The web preview uses a service worker
 * so the same handlers can be reviewed in a browser.
 */
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useMSW() {
  const [isReady, setIsReady] = useState(!__DEV__);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const enableMocking = async () => {
      if (Platform.OS === 'web') {
        const { worker } = await import('./browser');
        await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
        setIsReady(true);
        return;
      }

      const { server } = await import('./server');
      server.listen();
      setIsReady(true);
    };

    enableMocking().catch((error: unknown) => {
      console.error('Failed to enable MSW:', error);
      setIsReady(true);
    });
  }, []);

  return isReady;
}
