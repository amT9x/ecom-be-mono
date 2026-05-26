import { FastifyInstance } from "fastify";
import { PostgresUserRepository } from "../infrastructure/postgres-user.repository.js";
import { Pool } from "pg";
import { CreateUserUsecase } from "../application/create-user.usecase.js";
import { UserController } from "../presentation/http/user.controller.js";
import { userRoutes } from "../presentation/http/user.route.js";
import { PasswordService } from "../../../shared/security/password.service.js";
import { GetProfileUseCase } from "../application/get-profile.usecase.js";
import { UpdateProfileUsecase } from "../application/update-profile.usecase.js";
import { DeleteUserUsecase } from "../application/delete-user.usecase.js";

export async function registerUserModule(app: FastifyInstance, pool: Pool) {
  // repository
  const userRepository = new PostgresUserRepository(pool);

  // services
  const password_hash = new PasswordService();

  // usecases
  const createUserUsecase = new CreateUserUsecase(userRepository, password_hash);
  const getProfileUseCase = new GetProfileUseCase(userRepository);
  const updateProfileUseCase = new UpdateProfileUsecase(userRepository);
  const deleteUserUsecase = new DeleteUserUsecase(userRepository);

  // controller
  const userController = new UserController(
    createUserUsecase,
    getProfileUseCase,
    updateProfileUseCase,
    deleteUserUsecase,
  );

  // route
  app.register(
    userRoutes,
    {
      controller: userController
    }
  )
}
