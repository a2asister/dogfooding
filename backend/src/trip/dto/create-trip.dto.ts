import { InputType, Field } from '@nestjs/graphql';
import { CreateTripNodeInput } from './create-trip-node.dto';

@InputType()
export class CreateTripInput {
  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  category!: string;

  @Field(() => [CreateTripNodeInput], { nullable: true })
  nodes?: CreateTripNodeInput[];
}