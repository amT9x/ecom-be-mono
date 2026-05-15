const isProd = process.env.NODE_ENV === 'production';

export const loggerConfig = {
  level: isProd ? 'info' : 'debug',

  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          // ignore: 'err.stack',
        },
      },

  serializers: {
    err(error: any) {
      return {
        type: error.constructor?.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
      };
    },
  },
};
