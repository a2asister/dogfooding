import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: 'http://localhost:4396',
    credentials: true
  })
  
  await app.listen(4397)
  console.log('服务器运行在 http://localhost:4397')
  console.log('GraphQL playground: http://localhost:4397/graphql')
}

bootstrap()
