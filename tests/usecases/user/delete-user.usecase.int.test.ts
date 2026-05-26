import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabaseUser } from "../../setup/test_db";
import { seedUser } from "../../setup/seed-test";
import { USER } from "../../setup/constanst";
import { PostgresUserRepository } from "../../../src/modules/user/infrastructure/postgres-user.repository";
import { DeleteUserUsecase } from '../../../src/modules/user/application/delete-user.usecase';
import { testPool } from "../../setup/test_db";

describe("DeleteUserUsecase", () => {
  const repository = new PostgresUserRepository(testPool);
  const usecase = new DeleteUserUsecase(repository);
  beforeEach( async () => {
    await resetDatabaseUser();
    await seedUser(testPool, USER.id, USER.email, USER.password, USER.full_name);
  });
  it("should delete user from database", async () => {
    const deletedUser = await usecase.execute(USER.id);

    expect(deletedUser).toMatchObject({
      id: USER.id,
      email: USER.email,
      full_name: USER.full_name,
      role: USER.role,
    });

    const result = await testPool.query(
      `
        SELECT *
        FROM users
        WHERE id=$1
      `,
      [USER.id],
    );

    expect(result.rowCount).toBe(0);
  });
});
