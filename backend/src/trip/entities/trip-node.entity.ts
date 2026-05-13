import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Trip } from './trip.entity';

@ObjectType()
@Entity()
export class TripNode {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Field()
  @Column({ type: 'datetime' })
  arrivalTime!: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  note?: string;

  @Field()
  @Column({ default: 0 })
  order!: number;

  @Field(() => ID)
  @Column()
  tripId!: number;

  @ManyToOne(() => Trip, (trip) => trip.nodes)
  trip!: Trip;
}