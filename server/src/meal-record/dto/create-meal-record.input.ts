import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateMealRecordInput {
  @Field(() => Int)
  @IsNumber()
  @Min(1)
  foodId!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  quantity!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  mealType!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  date!: string;
}
