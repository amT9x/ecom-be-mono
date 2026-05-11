import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

const DATABASE_URL = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const client = new Client({
  connectionString: DATABASE_URL,
});

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    executed_at TIMESTAMP DEFAULT now()
  );
`);

const migrationsDir = './db/migration';
const files = fs.readdirSync(migrationsDir).sort();

for (const file of files) {
  const res = await client.query(
    'SELECT 1 FROM schema_migrations WHERE filename=$1',
    [file],
  );

  if (res.rowCount > 0) {
    console.log('Skipping:', file);
    continue;
  }

  console.log('Running:', file);

  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

  await client.query('BEGIN');

  try {
    await client.query(sql);

    await client.query('INSERT INTO schema_migrations(filename) VALUES($1)', [
      file,
    ]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

await client.end();

console.log('✅ migrations complete');
