import { FastifyReply, FastifyRequest } from "fastify";

export class AuthController {
  constructor(
    private readonly registerUsecase: any,
    private readonly loginUsecase: any,
    private readonly refreshTokenUsecase: any
  ) {}

  register = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.registerUsecase.execute(req.body);
    return reply.status(201).send(result);
  }

  login = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.loginUsecase.execute(req.body);
    return reply.status(200).send(result);
  }

  refresh_token = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as { refresh_token: string };
    console.log('body: ', body);
    const result = await this.refreshTokenUsecase.execute({
      refresh_token: body.refresh_token
    });
    return reply.status(200).send(result);
  }
}
