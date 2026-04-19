import { pino } from "pino";
import { loggerOptions } from "../../config/logger.options.js";

// Instance of pino
export const logger = pino(loggerOptions);
