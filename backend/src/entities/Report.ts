import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Note } from './Note';
import { Comment } from './Comment';

export enum ReportType {
  NOTE = 'note',
  COMMENT = 'comment',
  USER = 'user',
}

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'simple-enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column()
  targetId: string;

  @Column()
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  images: string[];

  @Column({
    type: 'simple-enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({ nullable: true })
  handleResult: string;

  @ManyToOne(() => User)
  reporter: User;

  @Column()
  reporterId: string;

  @ManyToOne(() => Note, { nullable: true })
  note: Note;

  @ManyToOne(() => Comment, { nullable: true })
  comment: Comment;

  @ManyToOne(() => User, { nullable: true })
  reportedUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
