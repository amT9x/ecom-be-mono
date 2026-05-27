import { JwtService } from '../../../shared/security/jwt.service.js';
import { PasswordService } from '../../../shared/security/password.service.js';
import { UserRepository } from '../../user/domain/user.repository.js';

type RrequestInput = {
  email: string;
  password: string;
  full_name: string;
};

type RegisterResponse = {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  access_token: string;
};

export class RegisterUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: RrequestInput): Promise<RegisterResponse> {
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
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      access_token,
    };
  }
}
