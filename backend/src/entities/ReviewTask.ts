import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Note } from './Note';
import { Comment } from './Comment';
import { User } from './User';

export enum ReviewType {
  NOTE = 'note',
  COMMENT = 'comment',
  USER = 'user',
  PRODUCT = 'product',
  TOPIC = 'topic',
}

export enum ReviewStatus {
  PENDING = 'pending',
  AI_APPROVED = 'ai_approved',
  AI_REJECTED = 'ai_rejected',
  MANUAL_APPROVED = 'manual_approved',
  MANUAL_REJECTED = 'manual_rejected',
  APPEAL_PENDING = 'appeal_pending',
  APPEAL_APPROVED = 'appeal_approved',
  APPEAL_REJECTED = 'appeal_rejected',
}

export enum ReviewLevel {
  AUTO = 'auto',
  LEVEL_1 = 'level_1',
  LEVEL_2 = 'level_2',
  LEVEL_3 = 'level_3',
}

@Entity('review_tasks')
export class ReviewTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-enum', enum: ReviewType })
  type: ReviewType;

  @Column({ nullable: true })
  noteId: string;

  @ManyToOne(() => Note, { nullable: true })
  note: Note;

  @Column({ nullable: true })
  commentId: string;

  @ManyToOne(() => Comment, { nullable: true })
  comment: Comment;

  @Column({ nullable: true })
  targetUserId: string;

  @ManyToOne(() => User, { nullable: true })
  targetUser: User;

  @Column({ type: 'simple-enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @Column({ type: 'simple-enum', enum: ReviewLevel, default: ReviewLevel.AUTO })
  level: ReviewLevel;

  @Column({ type: 'simple-json', nullable: true })
  aiResult: {
    passed: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    categories: string[];
    confidence: number;
    details: {
      type: string;
      description: string;
      position?: string;
    }[];
    suggestions?: string[];
  };

  @Column({ type: 'float', default: 0 })
  aiScore: number;

  @Column({ nullable: true })
  aiReviewedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  manualResult: {
    passed: boolean;
    violationType?: string;
    reason?: string;
    evidence?: string[];
  };

  @ManyToOne(() => User, { nullable: true })
  reviewer: User;

  @Column({ nullable: true })
  reviewerId: string;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectReason: string;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: false })
  isAppealed: boolean;

  @Column({ type: 'text', nullable: true })
  appealReason: string;

  @Column({ nullable: true })
  appealedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
