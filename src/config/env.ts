import dotenv from 'dotenv';
import { z } from 'zod';

const NODE_ENV = process.env.NODE_ENV ?? 'development';

if (NODE_ENV !== 'production') {
  const envFile = NODE_ENV === 'test' ? '.env.test' : '.env';

  dotenv.config({
    path: envFile,
  });
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  APP_NAME: z.string(),
  HOST: z.string(),
  PORT: z.coerce.number(),

  DB_URL: z.string(),
});

export const env = envSchema.parse(process.env);
