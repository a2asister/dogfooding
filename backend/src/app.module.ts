import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { SubtitleModule } from './subtitle/subtitle.module';
import { AudioModule } from './audio/audio.module';
import { ExportModule } from './export/export.module';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(process.cwd(), 'data', 'database.sqlite'),
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true,
      logging: false,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src', 'schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    SubtitleModule,
    AudioModule,
    ExportModule,
    ProjectModule,
  ],
})
export class AppModule {}
