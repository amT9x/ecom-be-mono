import fp from 'fastify-plugin';
import { requestContext } from '../infrastructure/context/request-context.js';
import { BaseError } from '../shared/errors/base-error.js';

export const errorHandler = fp(async function (app) {
  app.setErrorHandler((error, request, reply) => {
    const logger = request.log;

    // CLIENT ERROR
    if (error instanceof BaseError) {
      // to terminal console
      logger.warn(
        {
          code: error.code,
          method: request.method,
          url: request.routeOptions.url,
          query: request.query,
        },
        error.message,
      );

      // to client
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    // SYSTEM ERROR
    // to terminal console
    logger.error(
      {
        handler: requestContext.get()?.handler,
        service: requestContext.get()?.service,
        repo: requestContext.get()?.repo,
        method: request.method,
        url: request.routeOptions.url,
        err: error,
      },
      'unexpected system error',
    );

    // to client
    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  });
});
