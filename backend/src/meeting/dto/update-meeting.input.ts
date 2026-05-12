import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateMeetingInput {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  startTime?: Date;

  @Field({ nullable: true })
  endTime?: Date;
}
