import { ProductRepository } from '../domain/product.repository.js';
import {
  encodeCursor,
  decodeCursor,
} from '../../../shared/pagination/cursor.js';

import { ValidationError } from '../../../shared/errors/http-error.js';

export class ListProductsUsecase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: any) {
    const limitRaw = Number(query.limit);

    if (query.limit && Number.isNaN(limitRaw)) {
      throw new ValidationError('limit must be number');
    }

    const limit = Math.min(limitRaw || 10, 100);

    const sortRaw = query.sort || 'created_at.desc';

    const [sortField, sortOrderRaw] = sortRaw.split('.');

    const sortOrder = sortOrderRaw === 'asc' ? 'asc' : 'desc';

    let cursor = null;

    try {
      if (query.cursor) {
        cursor = decodeCursor(query.cursor);
      }
    } catch {
      throw new ValidationError('Invalid cursor');
    }

    const page = query.page ? Number(query.page) : undefined;

    const rows = await this.productRepository.findAll({
      cursor,
      limit,
      page,
      sortField,
      sortOrder,
    });

    let nextCursor = null;
    let hasNext = false;

    if (rows.length > limit) {
      hasNext = true;

      rows.pop();

      const lastItem = rows[rows.length - 1];

      nextCursor = encodeCursor({
        created_at: lastItem.created_at.toISOString(),
        id: lastItem.id,
      });
    }

    return {
      data: rows,

      pageInfo: {
        hasNext,
        nextCursor,
      },
    };
  }
}
