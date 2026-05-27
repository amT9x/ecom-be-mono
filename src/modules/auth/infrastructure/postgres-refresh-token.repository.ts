import { Pool } from 'pg';

import { RefreshTokenEntity } from '../domain/refresh-token.entity.js';
import { RefreshTokenRepository } from '../domain/refresh-token.repository.js';

export class PostgresRefreshTokenRepository
  implements RefreshTokenRepository
{
  constructor(private readonly pool: Pool) {}

  async create(
    data: {
      user_id: string;
      token: string;
      expires_at: Date;
    }
  ): Promise<RefreshTokenEntity> {
    const result = await this.pool.query(
      `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [data.user_id, data.token, data.expires_at],
    );

    const row = result.rows[0];
    return new RefreshTokenEntity(
      row.id,
      row.user_id,
      row.token,
      row.expires_at,
      row.revoked_at,
      row.created_at,
    );
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    const result = await this.pool.query(
      `
      SELECT *
      FROM refresh_tokens
      WHERE token=$1
      LIMIT 1
      `,
      [token],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }
    return new RefreshTokenEntity(
      row.id,
      row.user_id,
      row.token,
      row.expires_at,
      row.revoked_at,
      row.created_at,
    );
  }

  async revokeByToken(token: string): Promise<void> {
    await this.pool.query(
      `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token = $1
      `,
      [token],
    );
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.pool.query(
      `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1
      AND revoked_at IS NULL
      `,
      [userId],
    );
  }
}
