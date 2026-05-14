import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { KnowledgeCategoryService } from './knowledge-category.service';
import { CreateKnowledgeCategoryDto } from './dto/create-knowledge-category.dto';
import { UpdateKnowledgeCategoryDto } from './dto/update-knowledge-category.dto';
import { KnowledgeCategory } from '../entities/knowledge-category.entity';

@Controller('knowledge-categories')
export class KnowledgeCategoryController {
  constructor(private readonly categoryService: KnowledgeCategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateKnowledgeCategoryDto): Promise<KnowledgeCategory> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll(): Promise<KnowledgeCategory[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<KnowledgeCategory> {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateKnowledgeCategoryDto,
  ): Promise<KnowledgeCategory> {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(+id);
  }
}
