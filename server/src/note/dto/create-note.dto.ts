import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNumber()
  @IsOptional()
  elementId?: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;
}
