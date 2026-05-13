import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, Min } from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  coverImage!: string;

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  pages!: string[];

  @Field(() => Int)
  @Min(1)
  @IsNotEmpty()
  totalPages!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  author!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;
}
