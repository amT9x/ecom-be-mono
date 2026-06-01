import { RefreshTokenEntity } from '../domain/refresh-token.entity.js';

export abstract class RefreshTokenRepository {
  abstract create(data: {
    user_id: string;
    token: string;
    expires_at: Date;
  }): Promise<RefreshTokenEntity>;

  abstract findByToken(token: string): Promise<RefreshTokenEntity | null>;

  abstract revokeByToken(token: string): Promise<void>;

  abstract revokeAllByUserId(userId: string): Promise<void>;
}
