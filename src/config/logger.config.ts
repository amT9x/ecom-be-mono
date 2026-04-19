const isProd = process.env.NODE_ENV === "production";

export const loggerConfig = isProd
  ? {
      level: "info",
    }
  : {
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
        },
      },
    };
