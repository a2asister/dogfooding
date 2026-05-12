import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(4321);
  console.log('Backend running on http://localhost:4321');
  console.log('GraphQL playground: http://localhost:4321/graphql');
}
bootstrap();
