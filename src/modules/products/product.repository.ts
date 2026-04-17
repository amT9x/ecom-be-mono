import {pool} from "../../config/database.js";
import crypto from "node:crypto";

export async function createProduct(data: any) {
  const id = crypto.randomUUID();

  const result = await pool.query(
    `INSERT INTO products(id,name,price,stock)
     VALUES($1,$2,$3,$4)
     RETURNING *`,
    [id, data.name, data.price, data.stock || 0]
  );

  return result.rows[0];
}

export async function findProducts(cursor?: {created_at: string, id: string} | null, limit = 10) {
  let query = `
    SELECT *
    FROM products
  `;

  const values: any[] = [];

  if (cursor) {
    query += ` WHERE (created_at, id) < ($1, $2)`;
    values.push(cursor.created_at, cursor.id);
  }

  query += `
    ORDER BY created_at DESC, id DESC
    LIMIT $${values.length + 1}
  `;

  values.push(limit + 1);

  const result = await pool.query(query, values);

  return result.rows;
}

export async function findProductById(id: string) {
  const result = await pool.query(
    `SELECT * FROM products WHERE id=$1`,
    [id]
  );

  return result.rows[0];
}

export async function updateProduct(id: string, data: any) {
  const result = await pool.query(
    `UPDATE products
     SET name=$1, price=$2, stock=$3, updated_at=NOW()
     WHERE id=$4
     RETURNING *`,
    [data.name, data.price, data.stock, id]
  );

  return result.rows[0];
}

export async function deleteProduct(id: string) {
  await pool.query(`DELETE FROM products WHERE id=$1`, [id]);
}
