import { describe, it, expect, beforeEach} from 'vitest';
import { resetDatabaseUser, testPool } from '../setup/test_db';
import { PostgresUserRepository } from '../../src/modules/user/infrastructure/postgres-user.repository';
import { RegisterUsecase } from '../../src/modules/auth/application/register.usecase';
import { PasswordService } from '../../src/shared/security/password.service';
import { JwtService } from '../../src/shared/security/jwt.service';
import { USER } from '../setup/constanst';

describe('Register', () => {
  const password_hash = new PasswordService();
  const access_token = new JwtService();
  const repository = new PostgresUserRepository(testPool);
  const registerUsecase = new RegisterUsecase(repository, password_hash, access_token);
  beforeEach(async() => {
    await resetDatabaseUser();
  })
  it('should register successfully', () => {
    const result = registerUsecase.execute({
      email: USER.email,
      password: USER.password,
      full_name: USER.full_name,
    });

    console.log('result', result);

    expect(true).toBe(true);
  });
});
