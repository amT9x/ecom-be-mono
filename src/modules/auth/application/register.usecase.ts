import { JwtService } from '../../../shared/security/jwt.service.js';
import { PasswordService } from '../../../shared/security/password.service.js';
import { User } from '../../user/domain/user.entity.js';
import { UserRepository } from '../../user/domain/user.repository.js';

type Input = {
  email: string;
  password: string;
  full_name: string;
};

type Output = {
  user: User;
  access_token: string;
};

export class RegisterUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: Input): Promise<Output> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const password_hash = await this.passwordService.hash(input.password);

    const user = await this.userRepository.create({
      email: input.email,
      password_hash,
      full_name: input.full_name,
      role: 'USER',
    });

    const access_token = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      access_token,
    };
  }
}
