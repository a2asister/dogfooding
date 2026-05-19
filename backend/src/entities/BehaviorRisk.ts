import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Note } from './Note';
import { Comment } from './Comment';

export enum RiskType {
  BRUSH_LIKE = 'brush_like',
  BRUSH_FAVORITE = 'brush_favorite',
  BRUSH_COMMENT = 'brush_comment',
  BRUSH_FOLLOW = 'brush_follow',
  SPAM_COMMENT = 'spam_comment',
  MALICIOUS_REPORT = 'malicious_report',
  BOT_ACTIVITY = 'bot_activity',
  SUSPICIOUS_BEHAVIOR = 'suspicious_behavior',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum RiskStatus {
  DETECTED = 'detected',
  REVIEWING = 'reviewing',
  CONFIRMED = 'confirmed',
  DISMISSED = 'dismissed',
  PROCESSED = 'processed',
}

@Entity('behavior_risks')
export class BehaviorRisk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-enum', enum: RiskType })
  type: RiskType;

  @Column({ type: 'simple-enum', enum: RiskLevel })
  level: RiskLevel;

  @Column({ type: 'simple-enum', enum: RiskStatus, default: RiskStatus.DETECTED })
  status: RiskStatus;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => Note, { nullable: true })
  note: Note;

  @Column({ nullable: true })
  noteId: string;

  @ManyToOne(() => Comment, { nullable: true })
  comment: Comment;

  @Column({ nullable: true })
  commentId: string;

  @Column({ type: 'simple-json', nullable: true })
  involvedUserIds: string[];

  @Column({ type: 'simple-json' })
  evidence: {
    rule: string;
    description: string;
    metrics: Record<string, any>;
    timestamps?: string[];
    ipAddresses?: string[];
  };

  @Column({ type: 'float', default: 0 })
  confidence: number;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'simple-json', nullable: true })
  deviceInfo: {
    deviceId?: string;
    platform?: string;
    appVersion?: string;
  };

  @ManyToOne(() => User, { nullable: true })
  reviewer: User;

  @Column({ nullable: true })
  reviewerId: string;

  @Column({ type: 'text', nullable: true })
  reviewNote: string;

  @Column({ type: 'simple-json', nullable: true })
  actionsTaken: {
    type: string;
    description: string;
    timestamp: string;
  }[];

  @CreateDateColumn()
  detectedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  processedAt: Date;
}
