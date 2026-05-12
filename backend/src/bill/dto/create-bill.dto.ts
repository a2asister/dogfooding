import { IsEnum, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { BillType, BillCategory } from '../bill.entity';

export class CreateBillDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsEnum(BillType)
  type: BillType;

  @IsEnum(BillCategory)
  category: BillCategory;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  description?: string;
}
