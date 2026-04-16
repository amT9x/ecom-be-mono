import fp from "fastify-plugin";
import crypto from "node:crypto";

export const requestContextPlugin = fp(async function (app) {
  app.addHook("onRequest", async (req) => {
    const requestId = crypto.randomUUID();

    req.headers["x-request-id"] = requestId;

    req.log.info({ requestId }, "onRequest hook");
  });
});
