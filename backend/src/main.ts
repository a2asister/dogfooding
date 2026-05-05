import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));
  
  app.use(
    session({
      secret: 'cloud-sync-secret-key-2026',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );
  
  app.setGlobalPrefix('api');
  
  await app.listen(3000);
  console.log('Cloud Sync Backend running on http://localhost:3000');
}
bootstrap();
