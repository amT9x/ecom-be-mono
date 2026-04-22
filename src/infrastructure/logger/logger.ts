import { pino } from 'pino';
import { loggerConfig } from '../../config/logger.config.js';
import { requestContext } from '../context/request-context.js';

// Instance of pino
export const logger = pino({
  ...loggerConfig,

  mixin() {
    return requestContext.get() ?? {};
  },
});
