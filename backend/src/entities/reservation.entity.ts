import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity()
export class Reservation {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  userName: string;

  @Field()
  @Column()
  phone: string;

  @Field()
  @Column()
  houseId: number;

  @Field()
  @Column({ type: 'datetime' })
  reservationTime: Date;

  @Field()
  @Column({ default: 'pending' })
  status: string;

  @Field()
  @Column({ type: 'text', default: '' })
  remark: string;

  @Field()
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
