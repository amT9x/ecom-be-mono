// logger everywhere
import { logger } from "./logger.js";

export const systemLogger = logger.child({
  scope: "system",
  component: "bootstrap",
});
