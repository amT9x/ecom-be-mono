import { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { productRoutes } from '../presentation/http/product.route.js';
import { ProductController } from '../presentation/http/product.controller.js';
import { PostgresProductRepository } from '../infrastructure/postgres-product.repository.js';
import { CreateProductUsecase } from '../application/create-product.usecase.js';
import { GetProductUsecase } from '../application/get-product.usecase.js';
import { ListProductsUsecase } from '../application/list-products.usecase.js';
import { UpdateProductUsecase } from '../application/update-product.usecase.js';
import { DeleteProductUsecase } from '../application/delete-product.usecase.js';

export async function registerProductModule(app: FastifyInstance, pool: Pool) {
  // repository
  const productRepository = new PostgresProductRepository(pool);

  // usecases
  const createProductUsecase = new CreateProductUsecase(productRepository);
  const getProductUsecase = new GetProductUsecase(productRepository);
  const listProductsUsecase = new ListProductsUsecase(productRepository);
  const updateProductUsecase = new UpdateProductUsecase(productRepository);
  const deleteProductUsecase = new DeleteProductUsecase(productRepository);

  // controller
  const productController = new ProductController(
    createProductUsecase,
    getProductUsecase,
    listProductsUsecase,
    updateProductUsecase,
    deleteProductUsecase,
  );

  // routes
  app.register(productRoutes, {
    controller: productController,
  });
}
