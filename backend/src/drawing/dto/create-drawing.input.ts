import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator'

@InputType()
class DrawingPathInput {
  @Field()
  @IsString()
  id!: string

  @Field()
  @IsString()
  pathData!: string

  @Field()
  @IsString()
  strokeColor!: string

  @Field()
  @IsNumber()
  strokeWidth!: number

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fillColor?: string
}

@InputType()
export class CreateDrawingInput {
  @Field()
  @IsString()
  name!: string

  @Field(() => [DrawingPathInput])
  @IsArray()
  paths!: DrawingPathInput[]
}
