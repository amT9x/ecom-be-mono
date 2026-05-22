import { ProductRepository } from '../domain/product.repository.js';

export class UpdateProductUsecase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string, body: any) {
    return this.productRepository.update(id, body);
  }
}
