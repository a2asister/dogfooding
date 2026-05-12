import { IsEnum, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { BillType, BillCategory } from '../bill.entity';

export class UpdateBillDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(BillType)
  type?: BillType;

  @IsOptional()
  @IsEnum(BillCategory)
  category?: BillCategory;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
