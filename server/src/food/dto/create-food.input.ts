import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateFoodInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  category!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  calories!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  protein!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  fat!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  carbs!: number;

  @Field({ nullable: true })
  unit?: string;

  @Field({ nullable: true })
  image?: string;
}
