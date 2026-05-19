import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Note } from './Note';
import { User } from './User';

export enum RestrictionType {
  LOW_QUALITY = 'low_quality',
  DUPLICATE = 'duplicate',
  VIOLATION = 'violation',
  SPAM = 'spam',
  MANUAL = 'manual',
}

export enum RestrictionLevel {
  LIMIT_FLOW = 'limit_flow',
  NO_RECOMMEND = 'no_recommend',
  ONLY_FOLLOWERS = 'only_followers',
  HIDDEN = 'hidden',
}

@Entity('content_restrictions')
export class ContentRestriction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Note)
  note: Note;

  @Column()
  noteId: string;

  @Column({ type: 'simple-enum', enum: RestrictionType })
  type: RestrictionType;

  @Column({ type: 'simple-enum', enum: RestrictionLevel })
  level: RestrictionLevel;

  @Column({ type: 'simple-json', nullable: true })
  reasons: {
    category: string;
    description: string;
    confidence: number;
  }[];

  @Column({ type: 'float', default: 1.0 })
  flowMultiplier: number;

  @Column({ nullable: true })
  operatorId: string;

  @ManyToOne(() => User, { nullable: true })
  operator: User;

  @Column({ nullable: true })
  remark: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  liftedAt: Date;
}
