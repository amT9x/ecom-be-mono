// create fastify server
import Fastify from 'fastify';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const app = Fastify({ logger: false});

app.get('/', async () => {
  return { app: 'ecom' };
});

app.get('/health', async () => {
  return { status: 'ok' }
});

const start = async () => {
  try {
    await app.listen({
      host: HOST,
      port: PORT
    });
    console.log(`Server is running on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
  }
};

start();
