import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Note } from './Note';
import { User } from './User';

export enum CopyrightClaimStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  APPEALED = 'appealed',
  RESOLVED = 'resolved',
}

export enum CopyrightViolationType {
  PLAGIARISM = 'plagiarism',
  REPOST = 'repost',
  TRADEMARK = 'trademark',
  COPYRIGHT = 'copyright',
  PRIVACY = 'privacy',
  OTHER = 'other',
}

@Entity('copyright_claims')
@Index(['originalNoteId', 'infringingNoteId'], { unique: true })
export class CopyrightClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Note)
  originalNote: Note;

  @Column()
  originalNoteId: string;

  @ManyToOne(() => Note)
  infringingNote: Note;

  @Column()
  infringingNoteId: string;

  @ManyToOne(() => User)
  claimant: User;

  @Column()
  claimantId: string;

  @Column({
    type: 'simple-enum',
    enum: CopyrightViolationType,
  })
  violationType: CopyrightViolationType;

  @Column({
    type: 'simple-enum',
    enum: CopyrightClaimStatus,
    default: CopyrightClaimStatus.PENDING,
  })
  status: CopyrightClaimStatus;

  @Column({ type: 'float', default: 0 })
  similarityScore: number;

  @Column({ type: 'simple-json', nullable: true })
  evidence: {
    originalContent?: string;
    infringingContent?: string;
    matchedSegments?: string[];
    imageEvidence?: string[];
    additionalLinks?: string[];
  };

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  reviewNote: string;

  @ManyToOne(() => User, { nullable: true })
  reviewer: User;

  @Column({ nullable: true })
  reviewerId: string;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  resolution: {
    action: 'takedown' | 'edit' | 'ignore';
    permanentBan?: boolean;
    contentWarning?: boolean;
    attributionRequired?: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;
}
