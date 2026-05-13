import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateHouseInput {
  @Field()
  houseNumber: string;

  @Field()
  floorId: number;

  @Field()
  houseTypeId: number;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  orientation?: string;
}

@InputType()
export class UpdateHouseInput {
  @Field({ nullable: true })
  houseNumber?: string;

  @Field({ nullable: true })
  price?: number;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  orientation?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}
