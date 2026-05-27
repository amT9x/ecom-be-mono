import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { PostgresUserRepository } from "../../user/infrastructure/postgres-user.repository.js";
import { PasswordService } from "../../../shared/security/password.service.js";
import { CreateUserUsecase } from "../../user/application/create-user.usecase.js";
import { AuthController } from "../presentation/http/auth.controller.js";
import { AuthRoute } from "../presentation/http/auth.route.js";

export async function registerAuthModule(app: FastifyInstance, pool: Pool) {
  //repository
  const userRepository = new PostgresUserRepository(pool);

  //services
  const password_hash = new PasswordService();

  //usecase
  const createUserUsecase = new CreateUserUsecase(userRepository, password_hash);

  //controller
  const authController = new AuthController(createUserUsecase);

  //route
  app.register(AuthRoute, {
    controller: authController,
  });
}
