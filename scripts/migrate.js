import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

console.log('DB_URL:', process.env.DB_URL);

const client = new Client({
  connectionString: process.env.DB_URL || process.env.TEST_DB_URL,
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
