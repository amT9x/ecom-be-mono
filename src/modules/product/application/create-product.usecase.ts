import { ProductRepository } from '../domain/product.repository.js';

export class CreateProductUsecase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(body: any) {
    return this.productRepository.create(body);
  }
}
