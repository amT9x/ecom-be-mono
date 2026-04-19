import * as service from "./product.service.js";
import { FastifyRequest, FastifyReply } from "fastify";
import { requestContext } from "../../infrastructure/context/request-context.js";

type GetProductParams = {
  id: string;
};

export async function createProductController(req: FastifyRequest, reply: FastifyReply) {
  const product = await service.createProductService(req.body);
  return reply.send(product);
}

export async function getProductsController(req: FastifyRequest, reply: FastifyReply) {
  requestContext.set("handler", "getProductsController");
  const products = await service.getProductsService(req.query);
  return reply.send(products);
}

export async function getProductController(req: FastifyRequest<{Params: GetProductParams}>, reply: FastifyReply) {
  const product = await service.getProductService(req.params.id);
  return reply.send(product);
}

export async function updateProductController(req: FastifyRequest<{Params: GetProductParams}>, reply: FastifyReply) {
  const product = await service.updateProductService(
    req.params.id,
    req.body
  );

  return reply.send(product);
}

export async function deleteProductController(req: FastifyRequest<{Params: GetProductParams}>, reply: FastifyReply) {
  await service.deleteProductService(req.params.id);
  return reply.send({ success: true });
}
