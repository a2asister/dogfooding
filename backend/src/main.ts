import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*',
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(3000);
  console.log('Backend is running on port 3000');
  console.log('WebSocket is available on the same port');
}

bootstrap();
