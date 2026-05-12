import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3789);
  console.log('CRT Terminal Server running on http://localhost:3789');
}
bootstrap();
