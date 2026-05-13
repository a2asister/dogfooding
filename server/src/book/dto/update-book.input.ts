import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateBookInput } from './create-book.input';
import { IsString, IsOptional, IsArray, IsBoolean, Min } from 'class-validator';

@InputType()
export class UpdateBookInput extends PartialType(CreateBookInput) {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  pages?: string[];

  @Field(() => Int, { nullable: true })
  @Min(1)
  @IsOptional()
  totalPages?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  author?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
