import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: 'http://localhost:4200',
  })

  await app.listen(4201)
  console.log('Backend is running on: http://localhost:4201')
  console.log('GraphQL Playground: http://localhost:4201/graphql')
}

bootstrap()
