import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3876',
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  
  await app.listen(3877);
  console.log('后端服务已启动: http://localhost:3877');
}

bootstrap();
