import { FastifyInstance } from "fastify";
import { createUserSchema } from "./user.schema.js";

export function userRoutes(app: FastifyInstance, options: any) {
  const controller = options.controller;

  app.post(
    '/users',
    {schema: createUserSchema},
    controller.createUser);

  app.get(
    '/users/:id',
    controller.getProfile);

  app.put(
    '/users/:id',
    controller.updateProfile);

  app.delete(
    '/users/:id',
    controller.deleteUser);
}
