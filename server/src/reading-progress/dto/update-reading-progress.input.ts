import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateReadingProgressInput } from './create-reading-progress.input';
import { IsBoolean, IsOptional, Min } from 'class-validator';

@InputType()
export class UpdateReadingProgressInput extends PartialType(CreateReadingProgressInput) {
  @Field(() => Int, { nullable: true })
  @Min(0)
  @IsOptional()
  currentPage?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isBookmarked?: boolean;
}
