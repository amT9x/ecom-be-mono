import { access } from "node:fs";
import { JwtService } from "../../../shared/security/jwt.service.js";
import { PasswordService } from "../../../shared/security/password.service.js";
import { UserRepository } from "../../user/domain/user.repository.js";
import { appLogger } from "../../../infrastructure/logger/app.logger.js";

type LoginInput = {
  email: string;
  password: string;
}

type LoginResponse = {
  access_token: string;
  refresh_token: string
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService
  ) {}

  async execute(input: LoginInput): Promise<LoginResponse> {

    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await this.passwordService.compare(
      input.password,
      user.password_hash
    )

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const access_token = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refresh_token = this.jwtService.generateRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    appLogger.info(
      {
        userId: user.id,
        email: user.email,
      },
      'User logged in',
    );

    return {
      access_token,
      refresh_token
    }
  }
}
