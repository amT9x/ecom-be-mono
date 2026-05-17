import { env } from '../config/env.js';
import { buildApp } from './app.js';
import { systemLogger } from '../infrastructure/logger/index.js';

const HOST = env.HOST || '0.0.0.0';
const PORT = env.PORT || 3000;

const startServer = async () => {
  const app = buildApp();

  try {
    await app.listen({ host: HOST, port: PORT });
    systemLogger.info({ host: HOST, port: PORT }, 'Server is running');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();
