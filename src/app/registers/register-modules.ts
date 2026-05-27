import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { registerProductModule } from "../../modules/product/composition/product.module.js";
import { registerUserModule } from "../../modules/user/composition/user.module.js";
import { registerAuthModule } from "../../modules/auth/composition/auth.module.js";

export async function registerModules (
  app: FastifyInstance,
  pool: Pool
) {
  await registerProductModule(app, pool);
  await registerUserModule(app, pool);
  await registerAuthModule(app, pool);
}


