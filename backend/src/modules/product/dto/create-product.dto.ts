import { IsString, IsNumber, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  price!: number;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsNumber()
  categoryId!: number;

  @IsNumber()
  sellerId!: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
