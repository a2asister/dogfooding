import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeNode } from './knowledge-node.entity';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeNode])],
  providers: [KnowledgeService],
  controllers: [KnowledgeController],
})
export class KnowledgeModule {}
