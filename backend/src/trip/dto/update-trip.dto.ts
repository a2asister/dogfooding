import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateTripInput {
  @Field(() => ID)
  id!: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  isArchived?: boolean;
}