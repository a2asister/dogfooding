import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateConfigInput {
  @Field()
  name: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  value: string;

  @Field({ defaultValue: false })
  enabled?: boolean;

  @Field()
  group: string;
}

@InputType()
export class UpdateConfigInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  value?: string;

  @Field({ nullable: true })
  enabled?: boolean;

  @Field({ nullable: true })
  group?: string;
}
