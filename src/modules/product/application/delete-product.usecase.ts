import { ProductRepository } from '../domain/product.repository.js';

export class DeleteProductUsecase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string) {
    return this.productRepository.delete(id);
  }
}
