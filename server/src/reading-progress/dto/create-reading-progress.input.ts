import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsBoolean, IsOptional, Min } from 'class-validator';

@InputType()
export class CreateReadingProgressInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  bookId!: string;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @Field(() => Int, { defaultValue: 0 })
  @Min(0)
  @IsOptional()
  currentPage?: number;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isBookmarked?: boolean;
}
