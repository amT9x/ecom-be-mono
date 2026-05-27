import { FastifyReply, FastifyRequest } from "fastify";

type GetProfileParams = {
  id: string;
}

export class UserController {
  constructor(
    private readonly createUserUsecase: any,
    private readonly getProfileUseCase: any,
    private readonly updateProfileUserUseCase: any,
    private readonly deleteUserUsecase: any,
  ) {}

  createUser = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.createUserUsecase.execute(req.body);
    return reply.send(result);
  };

  getProfile = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const result = await this.getProfileUseCase.execute(req.user.id);
    return reply.status(200).send(result);
  };

  updateProfile = async (
    req: FastifyRequest<{ Params: GetProfileParams }>,
    reply: FastifyReply,
  ) => {
    const result = await this.updateProfileUserUseCase.execute({
      id: req.params.id,
      body: req.body
    });
    return reply.send(result);
  };

  deleteUser = async (
    req: FastifyRequest<{ Params: GetProfileParams }>,
    reply: FastifyReply,
  ) => {
    const result = await this.deleteUserUsecase.execute(req.params.id);
    return reply.send(result);
  };
}
