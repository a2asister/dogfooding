import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = 4873;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/graphql`);
}
bootstrap();
