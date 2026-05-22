import crypto from 'node:crypto';
import { Pool } from 'pg';

import {
  ProductRepository,
  FindProductsOptions,
} from '../domain/product.repository.js';

import { Product } from '../domain/product.entity.js';

export class PostgresProductRepository implements ProductRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: Partial<Product>) {
    const id = crypto.randomUUID();

    const result = await this.pool.query(
      `
      INSERT INTO products(id,name,price,stock)
      VALUES($1,$2,$3,$4)
      RETURNING *
      `,
      [id, data.name, data.price, data.stock || 0],
    );

    return result.rows[0];
  }

  async findAll(options: FindProductsOptions) {
    const { cursor, limit, page, sortField, sortOrder } = options;

    let query = `
      SELECT *
      FROM products
    `;

    const values: any[] = [];

    if (cursor) {
      const operator = sortOrder === 'desc' ? '<' : '>';

      query += `
        WHERE (${sortField}, id)
        ${operator}
        ($1, $2)
      `;

      values.push(cursor.created_at, cursor.id);
    }

    query += `
      ORDER BY
        ${sortField} ${sortOrder.toUpperCase()},
        id ${sortOrder.toUpperCase()}
    `;

    if (page && !cursor) {
      const offset = (page - 1) * limit;

      query += `
        OFFSET $${values.length + 1}
      `;

      values.push(offset);
    }

    query += `
      LIMIT $${values.length + 1}
    `;

    values.push(limit + 1);

    const result = await this.pool.query(query, values);

    return result.rows;
  }

  async findById(id: string) {
    const result = await this.pool.query(
      `
      SELECT *
      FROM products
      WHERE id=$1
      `,
      [id],
    );

    return result.rows[0] || null;
  }

  async update(id: string, data: Partial<Product>) {
    const result = await this.pool.query(
      `
      UPDATE products
      SET
        name=$1,
        price=$2,
        stock=$3
      WHERE id=$4
      RETURNING *
      `,
      [data.name, data.price, data.stock, id],
    );

    return result.rows[0];
  }

  async delete(id: string) {
    await this.pool.query(
      `
      DELETE FROM products
      WHERE id=$1
      `,
      [id],
    );
  }
}
