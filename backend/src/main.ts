import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:38765',
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  await app.listen(39876);
  console.log('🚀 Backend running on http://localhost:39876');
}

bootstrap();
