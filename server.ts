// create fastify server
import Fastify from 'fastify';

const app = Fastify({ logger: false});

app.get('/', async () => {
  return { app: 'ecom' };
});

app.get('/health', async () => {
  return { status: 'ok' }
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
  }
};

start();
