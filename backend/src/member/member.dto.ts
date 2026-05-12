import { InputType, Field, ObjectType } from '@nestjs/graphql'

@InputType()
export class UpdateMemberInput {
  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  role?: string

  @Field({ nullable: true })
  bio?: string
}

@ObjectType()
export class AuthUser {
  @Field()
  id: string

  @Field()
  name: string

  @Field()
  email: string

  @Field()
  token: string
}
