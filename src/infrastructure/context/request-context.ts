import { AsyncLocalStorage } from 'node:async_hooks';

export type requestContextParams = {
  requestId: string;
  userId?: undefined;
  actorType: 'user';
  handler?: string;
  service?: string;
  repo?: string;
  startTime: number;
};

const storage = new AsyncLocalStorage<requestContextParams>();

export const requestContext = {
  enter(ctx: requestContextParams) {
    storage.enterWith(ctx);
  },
  get: () => storage.getStore(),

  set<K extends keyof requestContextParams>(
    key: K,
    value: requestContextParams[K],
  ) {
    const store = storage.getStore();
    if (store) store[key] = value;
  },
};
