import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateMeetingInput {
  @Field()
  title: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;
}
