import { logger } from './logger.js';

export const appLogger = logger.child({
  scope: 'app',
});
