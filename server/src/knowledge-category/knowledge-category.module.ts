import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeCategory } from '../entities/knowledge-category.entity';
import { KnowledgeCategoryService } from './knowledge-category.service';
import { KnowledgeCategoryController } from './knowledge-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeCategory])],
  controllers: [KnowledgeCategoryController],
  providers: [KnowledgeCategoryService],
  exports: [KnowledgeCategoryService],
})
export class KnowledgeCategoryModule {}
