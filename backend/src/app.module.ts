import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeSnippet } from './entity/code-snippet.entity';
import { CodeSnippetService } from './code-snippet.service';
import { CodeSnippetController } from './code-snippet.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [CodeSnippet],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([CodeSnippet]),
  ],
  controllers: [CodeSnippetController],
  providers: [CodeSnippetService],
})
export class AppModule {}
