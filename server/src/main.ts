import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:5173', 
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176',
      'http://127.0.0.1:5177',
    ],
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  
  await app.listen(3001);
  console.log('🚀 Circuit Breaker Server running on http://localhost:3001');
}

bootstrap();
