import fp from "fastify-plugin";

export const loggerPlugin = fp(async function (app) {
  app.addHook("onResponse", async (req, rep) => {
    req.log.info(
      {
        statusCode: rep.statusCode,
        responseTime: rep.elapsedTime,
      },
      "onResponse hook"
    );
  });
});
