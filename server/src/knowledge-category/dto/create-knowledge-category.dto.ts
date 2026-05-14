import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateKnowledgeCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
