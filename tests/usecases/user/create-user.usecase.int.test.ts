import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabaseUser, testPool } from "../../setup/test_db";
import { USER } from "../../setup/constanst";
import { CreateUserUsecase } from "../../../src/modules/user/application/create-user.usecase";
import { PostgresUserRepository } from "../../../src/modules/user/infrastructure/postgres-user.repository";
import { PasswordService } from "../../../src/shared/security/password.service";

describe("CreateUserUseCase", () => {
  const password_hash = new PasswordService();
  const repository = new PostgresUserRepository(testPool);
  const usecase = new CreateUserUsecase(repository, password_hash);

  beforeEach(async() => {
    await resetDatabaseUser();
  });

  it("should create user successfully", async () => {
    const result = await usecase.execute({
      email: USER.email,
      password: USER.password,
      full_name: USER.full_name,
    });
    expect(result).toMatchObject({
      email: USER.email,
      full_name: USER.full_name,
      role: USER.role,
    });
  });
});
