import dotenv from 'dotenv';
import { z } from 'zod';
import { systemLogger } from '../infrastructure/logger/system.logger.js';

const APP_ENV = process.env.APP_ENV ?? 'local';

if (!process.env.RUNNING_IN_DOCKER && process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: `.env.${APP_ENV}`,
    quiet: true,
  });
} else if (process.env.RUNNING_IN_DOCKER) {
  systemLogger.info(
    { app_env: APP_ENV, status_docker: process.env.RUNNING_IN_DOCKER },
    'Environment variables loaded',
  );
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number(),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

export const env = envSchema.parse(process.env);
