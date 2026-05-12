import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: 'http://localhost:8765',
    credentials: true
  })
  
  app.useGlobalPipes(new ValidationPipe())
  
  await app.listen(9876)
  console.log('🚀 3D流程图服务启动在: http://localhost:9876')
  console.log('📊 GraphQL Playground: http://localhost:9876/graphql')
}

bootstrap()
