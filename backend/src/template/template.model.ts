import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { Resume } from '../resume/resume.model';

@ObjectType()
export class Template {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  layout: string;

  @Field()
  styles: string;

  @Field()
  userId: string;

  @Field(() => [Resume], { nullable: true })
  resumes?: Resume[];

  @Field()
  isPublic: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateTemplateInput {
  @Field()
  name: string;

  @Field()
  layout: string;

  @Field()
  styles: string;

  @Field()
  userId: string;
}

@InputType()
export class UpdateTemplateInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  layout?: string;

  @Field({ nullable: true })
  styles?: string;

  @Field({ nullable: true })
  isPublic?: boolean;
}
