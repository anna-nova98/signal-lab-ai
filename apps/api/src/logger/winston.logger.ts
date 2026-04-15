import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
// winston-loki uses CommonJS default export
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LokiTransport = require('winston-loki');

let winstonInstance: winston.Logger;

export function createLogger(): LoggerService {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}] ${message}${metaStr}`;
        }),
      ),
    }),
  ];

  const lokiUrl = process.env.LOKI_URL;
  if (lokiUrl) {
    transports.push(
      new LokiTransport({
        host: lokiUrl,
        labels: { app: 'signallab-api' },
        json: true,
        format: winston.format.json(),
        replaceTimestamp: true,
        onConnectionError: (err) => console.error('Loki connection error:', err),
      }),
    );
  }

  winstonInstance = winston.createLogger({
    level: 'info',
    transports,
  });

  // Adapter to NestJS LoggerService interface
  return {
    log: (message: string, context?: string) =>
      winstonInstance.info(message, { context }),
    error: (message: string, trace?: string, context?: string) =>
      winstonInstance.error(message, { trace, context }),
    warn: (message: string, context?: string) =>
      winstonInstance.warn(message, { context }),
    debug: (message: string, context?: string) =>
      winstonInstance.debug(message, { context }),
    verbose: (message: string, context?: string) =>
      winstonInstance.verbose(message, { context }),
  };
}

export function getLogger(): winston.Logger {
  if (!winstonInstance) {
    winstonInstance = winston.createLogger({
      level: 'info',
      transports: [new winston.transports.Console()],
    });
  }
  return winstonInstance;
}
