import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsArray, ArrayMinSize, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateColorSchemeInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(2)
  colors: string[];

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;
}
