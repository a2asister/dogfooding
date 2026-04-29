import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: '颜色格式必须为 #RRGGBB' })
  color?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  icon?: string;
}
