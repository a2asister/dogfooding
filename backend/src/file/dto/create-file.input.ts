import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsInt, Min } from 'class-validator';

@InputType()
export class CreateFileInput {
  @Field()
  @IsString()
  filename: string;

  @Field()
  @IsString()
  originalName: string;

  @Field()
  @IsString()
  mimeType: string;

  @Field()
  @IsInt()
  @Min(1)
  size: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  totalChunks: number;
}
