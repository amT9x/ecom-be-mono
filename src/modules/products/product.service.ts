import * as repo from "./product.repository.js";

export async function createProductService(body: any) {
  return repo.createProduct(body);
}

export async function getProductsService(query: any) {
  const limit = Number(query.limit) || 10;
  const cursor =
    query.created_at && query.id
    ? {
        created_at: query.created_at,
        id: query.id,
      }
    : null;

  const rows = await repo.findProducts(cursor, limit);

  let nextCursor = null;

  if (rows.length > limit) {
    rows.pop();

    const lastItem = rows[rows.length - 1];

    nextCursor = {
      created_at: lastItem.created_at,
      id: lastItem.id,
    }
  }

  return {
    data: rows,
    nextCursor,
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
