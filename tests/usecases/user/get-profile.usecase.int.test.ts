import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabaseUser, testPool } from "../../setup/test_db";
import { GetProfileUseCase } from "../../../src/modules/user/application/get-profile.usecase";
import { seedUser } from "../../setup/seed-test";
import { USER } from "../../setup/constanst";
import { PostgresUserRepository } from "../../../src/modules/user/infrastructure/postgres-user.repository";

describe("GetProfileUseCase", () => {
  let user: any;
  const repository = new PostgresUserRepository(testPool);
  const usecase = new GetProfileUseCase(repository);

  beforeEach( async() => {
    await resetDatabaseUser();
    await seedUser(testPool, USER.id, USER.email, USER.password, USER.full_name);
  });
  it("should get profile", async () => {
    const result = await usecase.execute(USER.id);

    expect(result).toMatchObject({
      id: USER.id,
      email: USER.email,
      full_name: USER.full_name,
      role: USER.role
    });
  });
});
