// create fastify server
import Fastify from 'fastify';

const PORT = 3000;
const app = Fastify({ logger: false});

app.get('/', async () => {
  return { app: 'ecom' };
});

app.get('/health', async () => {
  return { status: 'ok' }
});

const start = async () => {
  try {
    await app.listen({ port: PORT });
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
  }
};

start();
