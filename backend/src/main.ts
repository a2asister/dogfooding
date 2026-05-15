import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: 'http://localhost:3876',
    credentials: true
  })
  
  app.setGlobalPrefix('api')
  
  await app.listen(9876)
  console.log('Backend is running on: http://localhost:9876')
}

bootstrap()
