import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { TokenPayload } from '../../modules/auth/domain/token-payload.js';
const JWT_ACCESS_EXPIRES_IN = '15m'
export class JwtService {
  generateAccessToken(payload: TokenPayload) {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN_15M as jwt.SignOptions['expiresIn'],
    });
  }

  verifyAccessToken(token: string) {
    const payload = jwt.verify(token, env.JWT_SECRET);
    return payload as TokenPayload;
  }

  generateRefreshToken(payload: TokenPayload) {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN_7D as jwt.SignOptions['expiresIn'],
    });
  }

  verifyRefreshToken(token: string) {
    const payload = jwt.verify(token, env.JWT_SECRET);
    return payload as TokenPayload;
  }
}
