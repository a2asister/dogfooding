import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { MealRecord } from '../meal-record/meal-record.entity';

@ObjectType()
@Entity()
export class Food {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  category!: string;

  @Field(() => Float)
  @Column({ type: 'float' })
  calories!: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  protein!: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  fat!: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  carbs!: number;

  @Field()
  @Column({ default: 'g' })
  unit!: string;

  @Field()
  @Column({ default: '' })
  image!: string;

  @OneToMany(() => MealRecord, (mealRecord) => mealRecord.food)
  mealRecords!: MealRecord[];
}
