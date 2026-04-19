import { FastifyInstance } from "fastify";
import * as controller from "./product.controller.js";
import { createProductSchema } from "./product.schema.js";

export async function productRoutes(app: FastifyInstance) {
  app.post("/products", { schema: createProductSchema }, controller.createProductController);

  app.get("/products", controller.getProductsController);

  app.get("/products/:id", controller.getProductController);

  app.put("/products/:id", controller.updateProductController);

  app.delete("/products/:id", controller.deleteProductController);
}
