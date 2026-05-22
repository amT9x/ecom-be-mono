import { ProductRepository } from '../domain/product.repository.js';
import { ValidationError } from '../../../shared/errors/http-error.js';

export class GetProductUsecase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ValidationError('Product not found');
    }

    return product;
  }
}
