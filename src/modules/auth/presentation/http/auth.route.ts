import { FastifyInstance } from "fastify";
import { registerSchema } from "./auth.schema.js";

export function AuthRoute(app: FastifyInstance, options: any) {
  const controller = options.controller;

  app.post(
    '/auth/register',
    {schema: registerSchema},
    controller.register);

  app.post('/auth/login', controller.login);
}
