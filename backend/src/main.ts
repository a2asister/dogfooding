import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = 8765;

  app.enableCors({
    origin: 'http://localhost:9876',
    credentials: true,
  });

  await app.listen(port);
  Logger.log(`🚀 Backend running on http://localhost:${port}/graphql`, 'Bootstrap');
}

void bootstrap();
