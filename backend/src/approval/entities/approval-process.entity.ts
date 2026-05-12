import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ApprovalNode } from './approval-node.entity';

@ObjectType()
@Entity()
export class ApprovalProcess {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => [ApprovalNode])
  @OneToMany(() => ApprovalNode, (node) => node.process, { cascade: true })
  nodes: ApprovalNode[];
}
