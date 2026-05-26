import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabaseUser, testPool } from "../../setup/test_db";
import { seedUser } from "../../setup/seed-test";
import { USER } from "../../setup/constanst";
import { PostgresUserRepository } from "../../../src/modules/user/infrastructure/postgres-user.repository";
import { UpdateProfileUsecase } from '../../../src/modules/user/application/update-profile.usecase';

describe("UpdateProfileUserUseCase", () => {
  const repository = new PostgresUserRepository(testPool);
  const usecase = new UpdateProfileUsecase(repository);

  beforeEach( async () => {
    await resetDatabaseUser();
    await seedUser(testPool, USER.id, USER.email, USER.password, USER.full_name);
  })

  it("should update profile success", async () => {
    const updatedUser = await usecase.execute({
      id: USER.id,
      body: {
        email: USER.email,
        full_name: USER.full_name,
      }
    });

    expect(updatedUser).toMatchObject({
      id: USER.id,
      email: USER.email,
      full_name: USER.full_name,
      role: USER.role,
    });
  });
});
