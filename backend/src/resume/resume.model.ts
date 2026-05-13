import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { User } from '../user/user.model';
import { Template } from '../template/template.model';

@ObjectType()
export class Resume {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  layout: string;

  @Field()
  userId: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field({ nullable: true })
  templateId?: string;

  @Field(() => Template, { nullable: true })
  template?: Template;

  @Field()
  isPublished: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateResumeInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  layout: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  templateId?: string;
}

@InputType()
export class UpdateResumeInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  layout?: string;

  @Field({ nullable: true })
  templateId?: string;

  @Field({ nullable: true })
  isPublished?: boolean;
}
