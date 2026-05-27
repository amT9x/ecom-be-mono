import { access } from "node:fs";
import { JwtService } from "../../../shared/security/jwt.service.js";
import { PasswordService } from "../../../shared/security/password.service.js";
import { UserRepository } from "../../user/domain/user.repository.js";
import { appLogger } from "../../../infrastructure/logger/app.logger.js";
import { RefreshTokenRepository } from "../domain/refresh-token.repository.js";

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
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository
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

    await this.refreshTokenRepository.create({
      user_id: user.id,
      token: refresh_token,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
