import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Field, Int, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class CardStyleConfig {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ defaultValue: 200 })
  @Column({ default: 200 })
  cardWidth: number;

  @Field({ defaultValue: 280 })
  @Column({ default: 280 })
  cardHeight: number;

  @Field({ defaultValue: 15 })
  @Column({ default: 15 })
  borderRadius: number;

  @Field({ defaultValue: 20 })
  @Column({ default: 20 })
  spacing: number;

  @Field(() => Float, { defaultValue: 0.9 })
  @Column({ type: 'float', default: 0.9 })
  scaleOnHover: number;

  @Field({ defaultValue: true })
  @Column({ default: true })
  enableShadow: boolean;

  @Field({ defaultValue: true })
  @Column({ default: true })
  enableReflection: boolean;

  @Field({ defaultValue: 1000 })
  @Column({ default: 1000 })
  animationDuration: number;

  @Field(() => Int)
  @Column()
  userId: number;
}