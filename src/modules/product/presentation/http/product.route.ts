import { FastifyInstance } from 'fastify';
import { createProductSchema } from './product.schema.js';

export async function productRoutes(app: FastifyInstance, options: any) {
  const controller = options.controller;

  app.post(
    '/products',
    {schema: createProductSchema},
    controller.create);

  app.get('/products', controller.findAll);

  app.get('/products/:id', controller.findOne);

  app.put('/products/:id', controller.update);

  app.delete('/products/:id', controller.delete);
}
