import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Food } from '../food/food.entity';

@ObjectType()
@Entity()
export class MealRecord {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Int)
  @Column()
  foodId!: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  quantity!: number;

  @Field()
  @Column()
  mealType!: string;

  @Field()
  @Column()
  date!: string;

  @Field(() => Food)
  @ManyToOne(() => Food, (food) => food.mealRecords)
  @JoinColumn({ name: 'foodId' })
  food!: Food;
}
