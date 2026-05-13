import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3978',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  await app.listen(3979);
  console.log('Backend is running on http://localhost:3979/graphql');
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
});
