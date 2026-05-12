import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(4873);
  console.log('Backend running on http://localhost:4873/graphql');
}
bootstrap();
