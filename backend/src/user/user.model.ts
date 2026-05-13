import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { Resume } from '../resume/resume.model';
import { Template } from '../template/template.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => [Resume], { nullable: true })
  resumes?: Resume[];

  @Field(() => [Template], { nullable: true })
  templates?: Template[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;
}
