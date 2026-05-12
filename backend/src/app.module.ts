import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ColorResolver } from './resolvers/color.resolver';
import { ColorTheoryService } from './services/color-theory.service';
import { ImageAnalysisService } from './services/image-analysis.service';
import { Palette } from './entities/palette.entity';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'color-palettes.db',
      entities: [Palette],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Palette]),
  ],
  providers: [ColorResolver, ColorTheoryService, ImageAnalysisService],
})
export class AppModule {}
