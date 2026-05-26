import crypto from 'node:crypto';
import { Pool } from 'pg';

import { UserRepository } from '../domain/user.repository.js';
import { User } from '../domain/user.entity.js';

export type DBExecutor = {
  query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }>;
};

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly db: DBExecutor) {}

  async create(data: Partial<User>) {
    const id = crypto.randomUUID();

    const result = await this.db.query(
      `
      INSERT INTO users(
        id,
        email,
        password_hash,
        full_name,
        role
      )
      VALUES($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [id, data.email, data.password_hash, data.full_name, data.role || 'USER'],
    );

    return result.rows[0];
  }

  async findByEmail(email: string) {
    const result = await this.db.query(
      `
      SELECT *
      FROM users
      WHERE email=$1
      `,
      [email],
    );

    return result.rows[0] || null;
  }

  async findById(id: string) {
    const result = await this.db.query(
      `
      SELECT *
      FROM users
      WHERE id=$1
      `,
      [id],
    );

    return result.rows[0] || null;
  }

  async update(id: string, data: Partial<User>) {
    const result = await this.db.query(
      `
      UPDATE users
      SET
        email=$1,
        full_name=$2,
        updated_at=clock_timestamp()
      WHERE id=$3
      RETURNING *
      `,
      [data.email, data.full_name, id],
    );

    return result.rows[0];
  }

  async delete(id: string) {
    await this.db.query(
      `
      DELETE FROM users
      WHERE id=$1
      `,
      [id],
    );
  }
}
