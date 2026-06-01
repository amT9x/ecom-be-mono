// metadata of request lifecycle

import fp from 'fastify-plugin';
import crypto from 'node:crypto';
import { requestContext } from '../infrastructure/context/request-context.js';
import { appLogger } from '../infrastructure/logger/app.logger.js';

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

  app.addHook('onResponse', (req, reply, done) => {
    const ctx = requestContext.get();

    if (!ctx) {
      done();
      return;
    }

    const durationMs = Date.now() - ctx.startTime;

    appLogger.info(
      {
        // requestId: ctx.requestId,
        durationMs,
        statusCode: reply.statusCode,
      },
      'Request completed',
    );

    done();
  });
});
