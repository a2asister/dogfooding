import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(38765);
  console.log('Server running on http://localhost:38765/graphql');
}
bootstrap();
