import * as repo from "./product.repository.js";

export async function createProductService(body: any) {
  return repo.createProduct(body);
}

export async function getProductsService(query: any) {
  const limit = Number(query.limit) || 10;
  const offset = Number(query.offset) || 0;

  return repo.findProducts(limit, offset);
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
