import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Note } from './Note';
import { User } from './User';

export enum SupportType {
  COLD_START = 'cold_start',
  MANUAL_BOOST = 'manual_boost',
  NEW_CREATOR = 'new_creator',
  HIGH_QUALITY = 'high_quality',
  ACTIVITY = 'activity',
}

export enum SupportStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('flow_supports')
export class FlowSupport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Note)
  note: Note;

  @Column()
  noteId: string;

  @Column({ type: 'simple-enum', enum: SupportType })
  type: SupportType;

  @Column({ type: 'simple-enum', enum: SupportStatus, default: SupportStatus.ACTIVE })
  status: SupportStatus;

  @Column({ default: 1.0 })
  boostMultiplier: number;

  @Column({ default: 0 })
  targetViews: number;

  @Column({ default: 0 })
  deliveredViews: number;

  @Column({ default: 0 })
  budget: number;

  @Column({ default: 0 })
  spent: number;

  @ManyToOne(() => User, { nullable: true })
  operator: User;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}
