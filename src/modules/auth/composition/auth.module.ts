import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { PostgresUserRepository } from "../../user/infrastructure/postgres-user.repository.js";
import { PasswordService } from "../../../shared/security/password.service.js";
import { AuthController } from "../presentation/http/auth.controller.js";
import { AuthRoute } from "../presentation/http/auth.route.js";
import { RegisterUsecase } from "../application/register.usecase.js";
import { JwtService } from "../../../shared/security/jwt.service.js";
import { LoginUseCase } from "../application/login.usecase.js";

export async function registerAuthModule(app: FastifyInstance, pool: Pool) {
  //repository
  const userRepository = new PostgresUserRepository(pool);

  //services
  const password_hash = new PasswordService();
  const jwtService = new JwtService();

  //usecase
  const registerUsecase = new RegisterUsecase(userRepository, password_hash, jwtService);
  const loginUsecase = new LoginUseCase(userRepository, password_hash, jwtService);

  //controller
  const authController = new AuthController(
    registerUsecase,
    loginUsecase
  );

  //route
  app.register(AuthRoute, {
    controller: authController,
  });
}
