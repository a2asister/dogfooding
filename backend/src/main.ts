import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(8765);
  console.log('🚀 后端服务运行在 http://localhost:8765');
  console.log('📊 GraphQL Playground: http://localhost:8765/graphql');
}
bootstrap();
