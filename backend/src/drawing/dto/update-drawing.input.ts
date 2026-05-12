import { InputType, Field, PartialType, OmitType } from '@nestjs/graphql'
import { CreateDrawingInput } from './create-drawing.input'
import { IsString, IsOptional, IsArray } from 'class-validator'

@InputType()
class UpdateDrawingPathInput extends PartialType(OmitType(CreateDrawingInput, ['name'] as const)) {
  @Field()
  @IsString()
  id!: string
}

@InputType()
export class UpdateDrawingInput {
  @Field()
  @IsString()
  id!: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string

  @Field(() => [UpdateDrawingPathInput], { nullable: true })
  @IsOptional()
  @IsArray()
  paths?: UpdateDrawingPathInput[]
}
