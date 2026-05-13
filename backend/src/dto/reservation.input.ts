import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateReservationInput {
  @Field()
  userName: string;

  @Field()
  phone: string;

  @Field()
  houseId: number;

  @Field()
  reservationTime: Date;

  @Field({ nullable: true })
  remark?: string;
}
