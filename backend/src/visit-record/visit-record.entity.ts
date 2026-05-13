import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class VisitRecord {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  visitorIp?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userAgent?: string;

  @Field()
  @CreateDateColumn()
  visitedAt: Date;

  @Field(() => Int)
  @Column()
  userId: number;
}