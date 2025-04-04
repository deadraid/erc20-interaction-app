import { pino } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  ...(!isProduction && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true, // Enable colorized output
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', // Human-readable timestamp
        ignore: 'pid,hostname', // Hide process ID and hostname for cleaner logs
      },
    },
  }),
});
