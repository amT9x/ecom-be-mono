import { FastifyInstance } from "fastify";
import { createUserSchema } from "./user.schema.js";
import { authMiddleware } from "../../../../shared/http/auth.middleware.js";

export function userRoutes(app: FastifyInstance, options: any) {
  const controller = options.controller;

  app.post(
    '/users',
    {schema: createUserSchema},
    controller.createUser);

  app.get(
    '/users/me',
    {
      preHandler: authMiddleware
    },
    controller.getProfile);

  app.put(
    '/users/:id',
    controller.updateProfile);

  app.delete(
    '/users/:id',
    controller.deleteUser);
}
