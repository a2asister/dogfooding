import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3456);
  console.log('Backend server running on http://localhost:3456/graphql');
}

bootstrap();
