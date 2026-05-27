import { Pool } from "pg";
import { PasswordService } from "../../src/shared/security/password.service";

export async function seedUser (pool: Pool, USER_ID: string, USER_EMAIL: string, USER_PASSWORD: string, USER_FULL_NAME: string) {
  const passwordService = new PasswordService();
  const password_hash = await passwordService.hash(USER_PASSWORD);
  
  await pool.query(
    `
      INSERT INTO users
      (id, email, password_hash, full_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [USER_ID, USER_EMAIL, password_hash, USER_FULL_NAME],
  );
}

export async function seedProduct (pool: Pool, PRODUCT_ID: string, productsName: string, productPrice: number) {
  await pool.query(
    `INSERT INTO products(id, name, price)
       VALUES ($1,$2,$3)`,
    [PRODUCT_ID, productsName, productPrice],
  );
}

export async function seedInventory (pool: Pool, PRODUCT_ID: string, total_stock: number, reserved_stock: number) {
  await pool.query(
    `
      INSERT INTO inventory (product_id, total_stock, reserved_stock)
      VALUES ($1, $2, $3)
    `,
    [PRODUCT_ID, total_stock, reserved_stock],
  )
}

export async function seedOrder (pool: Pool, ORDER_ID: string, ORDER_STATUS: string, ORDER_TOTAL_AMOUNT: number) {
  await pool.query(
    `
      INSERT INTO orders (id, status, total_amount)
      VALUES ($1, $2, $3)
    `,
    [ORDER_ID, ORDER_STATUS, ORDER_TOTAL_AMOUNT],
  )
}
