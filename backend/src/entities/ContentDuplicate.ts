import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Note } from './Note';

export enum DuplicateStatus {
  PENDING = 'pending',
  DETECTED = 'detected',
  REVIEWED = 'reviewed',
  DISMISSED = 'dismissed',
}

@Entity('content_duplicates')
export class ContentDuplicate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Note)
  sourceNote: Note;

  @Column()
  sourceNoteId: string;

  @ManyToOne(() => Note)
  duplicateNote: Note;

  @Column()
  duplicateNoteId: string;

  @Column({ type: 'float' })
  similarity: number;

  @Column({ type: 'simple-enum', enum: DuplicateStatus, default: DuplicateStatus.PENDING })
  status: DuplicateStatus;

  @Column({ type: 'simple-json', nullable: true })
  matchDetails: {
    titleMatch?: number;
    contentMatch?: number;
    imageMatch?: number;
    matchedSegments?: string[];
  };

  @Column({ nullable: true })
  reviewerId: string;

  @Column({ nullable: true })
  reviewNote: string;

  @Column({ default: false })
  isRestricted: boolean;

  @CreateDateColumn()
  detectedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;
}
