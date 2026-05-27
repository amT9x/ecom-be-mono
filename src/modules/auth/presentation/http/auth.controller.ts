import { FastifyReply, FastifyRequest } from "fastify";

export class AuthController {
  constructor(
    private readonly registerUsecase: any
  ) {}

  register = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.registerUsecase.execute(req.body);
    return reply.status(201).send(result);
  }
}
