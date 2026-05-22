import { FastifyInstance } from "fastify";
import { loggerPlugin } from "../../plugins/request-lifecycle-logger.plugin.js";
import { requestContextPlugin } from "../../plugins/request-context.plugin.js";
import { errorHandler } from "../../plugins/error-handler.plugin.js";


export async function registerInfrastructure (app: FastifyInstance) {
  app.register(requestContextPlugin);
  app.register(loggerPlugin);
  app.register(errorHandler);
}
