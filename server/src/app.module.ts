import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeNode } from './knowledge/knowledge-node.entity';
import { KnowledgeModule } from './knowledge/knowledge.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: './data/knowledge.db',
      entities: [KnowledgeNode],
      synchronize: true,
    }),
    KnowledgeModule,
  ],
})
export class AppModule {}
