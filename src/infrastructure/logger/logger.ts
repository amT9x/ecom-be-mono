import { pino } from "pino";
import { loggerConfig } from "../../config/logger.config.js";

// Instance of pino
export const logger = pino(loggerConfig);
