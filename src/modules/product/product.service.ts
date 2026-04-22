import * as repo from './product.repository.js';
import { encodeCursor, decodeCursor } from '../../shared/pagination/cursor.js';
import { requestContext } from '../../infrastructure/context/request-context.js';

export async function createProductService(body: any) {
  return repo.createProduct(body);
}

export async function getProductsService(query: any) {
  requestContext.set('service', 'getProductsService');
  // LIMIT
  const limit = Math.min(Number(query.limit) || 10, 100);

  // SORT
  const sortRaw = query.sort || 'created_at.desc';
  const [sortField, sortOrderRaw] = sortRaw.split('.');

  const sortOrder = sortOrderRaw === 'asc' ? 'asc' : 'desc';

  // CURSOR (ENCODED)
  let cursor = null;

  if (query.cursor) {
    cursor = decodeCursor(query.cursor);
  }

  // PAGE
  const page = query.page ? Number(query.page) : undefined;

  // FETCH
  const rows = await repo.findProducts({
    cursor,
    limit,
    page,
    sortField,
    sortOrder,
  });

  // NEXT CURSOR
  let nextCursor = null;
  let hasNext = false;

  if (rows.length > limit) {
    hasNext = true;
    rows.pop();

    const lastItem = rows[rows.length - 1];

    nextCursor = encodeCursor({
      created_at: lastItem.created_at,
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

export async function getProductService(id: string) {
  return repo.findProductById(id);
}

export async function updateProductService(id: string, body: any) {
  return repo.updateProduct(id, body);
}

export async function deleteProductService(id: string) {
  return repo.deleteProduct(id);
}
