import { FastifyReply, FastifyRequest } from 'fastify';

type GetProductParams = {
  id: string;
};

export class ProductController {
  constructor(
    private readonly createProductUsecase: any,
    private readonly getProductUsecase: any,
    private readonly listProductsUsecase: any,
    private readonly updateProductUsecase: any,
    private readonly deleteProductUsecase: any,
  ) {}

  create = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.createProductUsecase.execute(req.body);

    return reply.send(result);
  };

  findAll = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.listProductsUsecase.execute(req.query);

    return reply.send(result);
  };

  findOne = async (
    req: FastifyRequest<{
      Params: GetProductParams;
    }>,
    reply: FastifyReply,
  ) => {
    const result = await this.getProductUsecase.execute(req.params.id);

    return reply.send(result);
  };

  update = async (
    req: FastifyRequest<{
      Params: GetProductParams;
    }>,
    reply: FastifyReply,
  ) => {
    const result = await this.updateProductUsecase.execute(
      req.params.id,
      req.body,
    );

    return reply.send(result);
  };

  delete = async (
    req: FastifyRequest<{
      Params: GetProductParams;
    }>,
    reply: FastifyReply,
  ) => {
    await this.deleteProductUsecase.execute(req.params.id);

    return reply.send({
      success: true,
    });
  };
}
