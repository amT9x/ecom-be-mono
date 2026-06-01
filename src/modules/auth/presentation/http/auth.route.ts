import { FastifyInstance } from "fastify";
import { registerSchema } from "./auth.schema.js";

export function AuthRoute(app: FastifyInstance, options: any) {
  const controller = options.controller;

  app.post(
    '/auth/register',
    {schema: registerSchema},
    controller.register);

  app.post('/auth/login', controller.login);

  app.post('/auth/logout', controller.logout);

  app.post('/auth/refresh-token', controller.refresh_token);
}
