import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateBuildingInput {
  @Field()
  name: string;

  @Field()
  address: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  totalFloors: number;
}

@InputType()
export class UpdateBuildingInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  totalFloors?: number;

  @Field({ nullable: true })
  isActive?: boolean;
}
