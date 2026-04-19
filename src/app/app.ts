import Fastify from "fastify";
import { pool } from "./config/database.js";
import { loggerOptions } from "./config/logger.options.js";
import { requestContextPlugin } from './plugins/request-context.plugin.js';
import { loggerPlugin } from './plugins/request-lifecycle-logger.plugin.js';
import { productRoutes } from "./modules/products/product.route.js";

export function buildApp() {
  const app = Fastify({logger:loggerOptions});

  app.register(requestContextPlugin);
  app.register(loggerPlugin);
  app.register(productRoutes);

  app.get('/', async () => {
    return { app: 'ecom' };
  });

  app.get('/health', async (req) => {
    req.log.info("health check");
    return { status_app: 'ok' }
  });

  app.get('/health/db', async () => {
    try {
      const client = await pool.connect();

      try {
        await client.query('SELECT 1');
      } finally {
        client.release();
      }
    } catch (error) {
      console.log("check db alive failed: ", error);
    }

    return {
      status_db: 'ok'
    }
  });

  app.post('/login', async () => {
    return {
      accessToken: 'abc123'
    };
  });

  app.get('/profile', async () => {
    return {
      id: 1,
      username: 'user1'
    };
  });

  return app;
}
