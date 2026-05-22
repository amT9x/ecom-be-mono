import { FastifyInstance } from "fastify";
import { Pool } from "pg";

export async function registerHealthCheck (
  app: FastifyInstance,
  pool: Pool
) {
  app.get('/', async () => {
    return { app: 'ecom' };
  })

  app.get('/health', async (req) => {
    req.log.info('health check');
    return { status_app: 'ok' };
  });

  app.get('/health/db', async () => {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return { status_db: 'ok' };
    } catch (err) {
      return { status_db: 'error' };
    } finally {
      client.release();
    }
  });
}
