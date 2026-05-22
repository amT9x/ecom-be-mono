import Fastify from 'fastify';
import { initializeDB } from '../config/database.js';
import { loggerConfig } from '../config/logger.config.js';
import { requestContextPlugin } from '../plugins/request-context.plugin.js';
import { loggerPlugin } from '../plugins/request-lifecycle-logger.plugin.js';
import { productRoutes } from '../modules/product/presentation/http/product.route.js';
import { errorHandler } from '../plugins/error-handler.plugin.js';
import { PostgresProductRepository } from '../modules/product/infrastructure/postgres-product.repository.js';
import { CreateProductUsecase } from '../modules/product/application/create-product.usecase.js';
import { GetProductUsecase } from '../modules/product/application/get-product.usecase.js';
import { ListProductsUsecase } from '../modules/product/application/list-products.usecase.js';
import { UpdateProductUsecase } from '../modules/product/application/update-product.usecase.js';
import { DeleteProductUsecase } from '../modules/product/application/delete-product.usecase.js';
import { ProductController } from '../modules/product/presentation/http/product.controller.js';

export function buildApp() {
  const app = Fastify({
    logger: loggerConfig,
    disableRequestLogging: true,
  });

  const pool = initializeDB();

  app.register(requestContextPlugin);
  app.register(errorHandler);
  app.register(loggerPlugin);

  // PRODUCT
  const productRepository = new PostgresProductRepository(pool);

  const createProductUsecase = new CreateProductUsecase(productRepository);
  const getProductUsecase = new GetProductUsecase(productRepository);
  const listProductsUsecase = new ListProductsUsecase(productRepository);
  const updateProductUsecase = new UpdateProductUsecase(productRepository);
  const deleteProductUsecase = new DeleteProductUsecase(productRepository);

  const productController = new ProductController(
    createProductUsecase,
    getProductUsecase,
    listProductsUsecase,
    updateProductUsecase,
    deleteProductUsecase,
  );


  app.register(
    productRoutes,
    {
      controller: productController,
    }
  );

  app.get('/', async () => {
    return { app: 'ecom' };
  });

  app.get('/health', async (req) => {
    req.log.info('health check');
    return { status_app: 'ok' };
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
      console.log('check db alive failed: ', error);
    }

    return {
      status_db: 'ok',
    };
  });

  app.post('/login', async () => {
    return {
      accessToken: 'abc123',
    };
  });

  app.get('/profile', async () => {
    return {
      id: 1,
      username: 'user1',
    };
  });

  return app;
}
