import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: 'http://localhost:4321',
    credentials: true
  })
  
  await app.listen(8765)
  console.log('🚀 Server running on http://localhost:8765')
  console.log('📊 GraphQL playground on http://localhost:8765/graphql')
}

bootstrap()
