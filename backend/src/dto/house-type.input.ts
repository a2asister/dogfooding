import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateHouseTypeInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  area: number;

  @Field()
  bedrooms: number;

  @Field()
  livingRooms: number;

  @Field()
  bathrooms: number;

  @Field({ nullable: true })
  floorPlanUrl?: string;
}
