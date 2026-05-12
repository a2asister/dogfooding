import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ApprovalProcess } from './approval-process.entity';

export enum NodeStatus {
  PENDING = 'pending',
  CURRENT = 'current',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@ObjectType()
@Entity()
export class ApprovalNode {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  role: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  approver: string;

  @Field(() => String)
  @Column({
    type: 'text',
    default: NodeStatus.PENDING,
  })
  status: NodeStatus;

  @Field()
  @Column()
  order: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  comment: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  approvedAt: Date;

  @ManyToOne(() => ApprovalProcess, (process) => process.nodes)
  @JoinColumn()
  process: ApprovalProcess;

  @Column()
  processId: number;
}
