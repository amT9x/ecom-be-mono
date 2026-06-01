import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtService } from '../security/jwt.service.js';
import { appLogger } from '../../infrastructure/logger/app.logger.js';

const jwtService = new JwtService();

export async function authMiddleware(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({
        error: 'Unauthorized',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).send({
        error: 'Unauthorized',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    const payload = jwtService.verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    return res.status(401).send({
      error: 'Unauthorized',
    });
  }
}
