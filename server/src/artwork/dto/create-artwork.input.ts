import { InputType, Field, Int } from '@nestjs/graphql'

@InputType()
export class CreateArtworkInput {
  @Field()
  text: string

  @Field()
  imageData: string

  @Field(() => Int)
  fontSize: number

  @Field(() => Int)
  particleSize: number

  @Field()
  colorStart: string

  @Field()
  colorEnd: string

  @Field({ nullable: true })
  category?: string
}
