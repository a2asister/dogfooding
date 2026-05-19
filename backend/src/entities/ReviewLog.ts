import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { ReviewTask } from './ReviewTask';

export enum ReviewAction {
  AI_REVIEW = 'ai_review',
  MANUAL_REVIEW = 'manual_review',
  APPROVE = 'approve',
  REJECT = 'reject',
  APPEAL_SUBMIT = 'appeal_submit',
  APPEAL_APPROVE = 'appeal_approve',
  APPEAL_REJECT = 'appeal_reject',
  ESCALATE = 'escalate',
  REASSIGN = 'reassign',
}

@Entity('review_logs')
export class ReviewLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ReviewTask)
  task: ReviewTask;

  @Column()
  taskId: string;

  @Column({ type: 'simple-enum', enum: ReviewAction })
  action: ReviewAction;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @ManyToOne(() => User, { nullable: true })
  operator: User;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    oldStatus?: string;
    newStatus?: string;
    reason?: string;
    evidence?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;
}
