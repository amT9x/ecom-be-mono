import Fastify from 'fastify';
import { initializeDB } from '../config/database.js';
import { loggerConfig } from '../config/logger.config.js';
import { registerModules } from './registers/register-modules.js';
import { registerInfrastructure } from './registers/register-infrastructure.js';
import { registerHealthCheck } from './registers/register-health-check.js';

export function buildApp() {
  const app = Fastify({
    logger: loggerConfig,
    disableRequestLogging: true,
  });

  const pool = initializeDB();

  registerInfrastructure(app);
  registerHealthCheck(app, pool);
  registerModules(app, pool);

  return app;
}
