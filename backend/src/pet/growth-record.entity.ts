import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Pet } from './pet.entity';

@ObjectType()
@Entity()
export class GrowthRecord {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  date: string;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  weight: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  height: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  note: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  milestone: string;

  @Field()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @ManyToOne(() => Pet, (pet) => pet.growthRecords)
  pet: Pet;
}
