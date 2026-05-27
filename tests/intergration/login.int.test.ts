import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase, resetDatabaseUser, testPool } from "../setup/test_db";
import { PasswordService } from "../../src/shared/security/password.service";
import { JwtService } from "../../src/shared/security/jwt.service";
import { PostgresUserRepository } from "../../src/modules/user/infrastructure/postgres-user.repository";
import { LoginUseCase } from "../../src/modules/auth/application/login.usecase";
import { USER } from "../setup/constanst";
import { seedUser } from "../setup/seed-test";

describe("Login", () => {
  const password_hash = new PasswordService();
  const jwttoken = new JwtService();
  const repositoryUser = new PostgresUserRepository(testPool);
  const loginUsecase = new LoginUseCase(repositoryUser, password_hash, jwttoken);
  beforeEach( async () => {
    await resetDatabaseUser();
    await seedUser(testPool, USER.id, USER.email, USER.password, USER.full_name);
  });

  it("should login successfully", async () => {
    const result = await loginUsecase.execute({
      email: USER.email,
      password: USER.password
    })

    expect(result.access_token).toBeDefined();
    expect(typeof result.access_token).toBe('string');
    expect(result.access_token.length).toBeGreaterThan(0);
  });
});
