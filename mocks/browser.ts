/**
 * Native builds start MSW from `server.ts`. This stub keeps the web-only
 * worker out of the iOS and Android bundles. Metro resolves `browser.web.ts`
 * when the preview is running in a browser.
 */
type WorkerStartOptions = {
  readonly onUnhandledRequest?: 'bypass' | 'warn' | 'error';
  readonly quiet?: boolean;
};

export const worker = {
  start: async (_options?: WorkerStartOptions) => undefined,
};
