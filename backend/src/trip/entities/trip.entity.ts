import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TripNode } from './trip-node.entity';

@ObjectType()
@Entity()
export class Trip {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column()
  category!: string;

  @Field()
  @Column({ default: false })
  isArchived!: boolean;

  @Field(() => Date)
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Field(() => [TripNode])
  @OneToMany(() => TripNode, (node) => node.trip, { cascade: true })
  nodes!: TripNode[];
}