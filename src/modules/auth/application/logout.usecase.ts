import { appLogger } from '../../../infrastructure/logger/app.logger.js';

import { RefreshTokenRepository } from '../domain/refresh-token.repository.js';

type Input = {
  refresh_token: string;
};

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: Input): Promise<void> {
    appLogger.info(
      {
        refresh_token: input.refresh_token,
      },
      'Logging out user',
    );

    const refresh_token = await this.refreshTokenRepository.findByToken(
      input.refresh_token,
    );

    if (!refresh_token) {
      return;
    }

    if (refresh_token.isRevoked()) {
      return;
    }

    await this.refreshTokenRepository.revokeByToken(input.refresh_token);
  }
}
