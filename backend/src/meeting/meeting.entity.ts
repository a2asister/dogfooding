import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Meeting {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  startTime: Date;

  @Column()
  @Field()
  endTime: Date;

  @Column({ default: false })
  @Field()
  isActive: boolean;

  @Column({ default: false })
  @Field()
  isCompleted: boolean;
}
