import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { createLogger } from './logger/winston.logger';

async function bootstrap() {
  // Init Sentry before anything else
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
    });
  }

  const logger = createLogger();
  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  app.enableCors({ origin: '*' });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Signal Lab API running on port ${port}`, 'Bootstrap');
}

bootstrap();
