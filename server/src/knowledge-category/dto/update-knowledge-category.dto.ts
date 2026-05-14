import { PartialType } from '@nestjs/mapped-types';
import { CreateKnowledgeCategoryDto } from './create-knowledge-category.dto';

export class UpdateKnowledgeCategoryDto extends PartialType(CreateKnowledgeCategoryDto) {}
