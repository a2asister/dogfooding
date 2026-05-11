import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://127.0.0.1:15173', 'http://127.0.0.1:15174', 'http://localhost:15173', 'http://localhost:15174'],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const PORT = parseInt(process.env.PORT, 10) || 18089;
  await app.listen(PORT);
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
}

bootstrap();
