import Fastify from "fastify";

export function buildApp() {
  const app = Fastify({logger: false});

  app.get('/', async () => {
    return { app: 'ecom' };
  });

  app.get('/health', async () => {
    return { status_app: 'ok' }
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
