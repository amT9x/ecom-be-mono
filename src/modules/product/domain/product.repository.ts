import { Product } from './product.entity.js';

export type FindProductsOptions = {
  cursor?: {
    created_at: string;
    id: string;
  } | null;

  limit: number;
  page?: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
};

export interface ProductRepository {
  create(data: Partial<Product>): Promise<Product>;

  findAll(options: FindProductsOptions): Promise<Product[]>;

  findById(id: string): Promise<Product | null>;

  update(id: string, data: Partial<Product>): Promise<Product>;

  delete(id: string): Promise<void>;
}
