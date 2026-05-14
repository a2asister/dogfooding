import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: 'http://localhost:38765',
    credentials: true
  })
  
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  
  await app.listen(38766)
  console.log('Backend server is running on http://localhost:38766')
}

bootstrap()
