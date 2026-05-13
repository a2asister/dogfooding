import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Skill {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Int)
  @Column({ default: 50 })
  proficiency: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon?: string;

  @Field()
  @Column({ default: '#1890ff' })
  primaryColor: string;

  @Field()
  @Column({ default: '#722ed1' })
  secondaryColor: string;

  @Field(() => Int)
  @Column({ default: 0 })
  positionX: number;

  @Field(() => Int)
  @Column({ default: 0 })
  positionY: number;

  @Field(() => Int)
  @Column({ default: 0 })
  rotation: number;

  @Field(() => Int)
  @Column()
  userId: number;
}