import { appLogger } from "../../../infrastructure/logger/app.logger.js"

type Input = {
  refresh_token: string;
};

type Output = {
  access_token: string
}

export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: any,
    private readonly userRepository: any
  ) {}

  async execute(input: Input): Promise<Output> {
    appLogger.info(
      {
        refresh_token: input.refresh_token
      },
      'Refreshing token'
    );
    const payload = this.jwtService.verifyRefreshToken(input.refresh_token);

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new Error('User not found');
    }

    const access_token = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token
    }
  }
}
