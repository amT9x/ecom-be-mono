// lifecycle observer

import fp from "fastify-plugin";

export const loggerPlugin = fp(async function (app) {

  app.addHook("onRequest", async (req) => {
    req.log.info(
      {
        method: req.method,
        url: req.url,
        host: req.host,
        ip: req.ip,
      },
      "onRequest: request started"
    );
  });

  app.addHook("onResponse", async (req, reply) => {
    req.log.info(
      {
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime,
      },
      "onResponse: request completed"
    );
  });
});
