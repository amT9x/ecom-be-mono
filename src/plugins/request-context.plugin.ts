// metadata of request lifecycle

import fp from 'fastify-plugin';
import crypto from 'node:crypto';
import { requestContext } from '../infrastructure/context/request-context.js';

export const requestContextPlugin = fp(function (app) {
  app.addHook('onRequest', (req, reply, done) => {
    const ctx = {
      requestId: req.id ?? crypto.randomUUID(),
      actorType: 'user' as const,
      startTime: Date.now(),
      userId: undefined,
    };

    requestContext.enter(ctx);
    done();
  });
});
