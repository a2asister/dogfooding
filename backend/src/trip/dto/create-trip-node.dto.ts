import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateTripNodeInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  address?: string;

  @Field()
  arrivalTime!: Date;

  @Field({ nullable: true })
  note?: string;

  @Field()
  order!: number;

  @Field(() => ID)
  tripId!: number;
}