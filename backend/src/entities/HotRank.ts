import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Note } from './Note';
import { Topic } from './Topic';
import { User } from './User';

export enum RankType {
  NOTE_HOT = 'note_hot',
  NOTE_RISING = 'note_rising',
  TOPIC_HOT = 'topic_hot',
  CREATOR_RISING = 'creator_rising',
}

@Entity('hot_ranks')
export class HotRank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-enum', enum: RankType })
  type: RankType;

  @Column({ nullable: true })
  noteId: string;

  @ManyToOne(() => Note, { nullable: true })
  note: Note;

  @Column({ nullable: true })
  topicId: string;

  @ManyToOne(() => Topic, { nullable: true })
  topic: Topic;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ default: 0 })
  rank: number;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'simple-json', nullable: true })
  scoreDetails: {
    baseScore: number;
    manualBoost: number;
    finalScore: number;
  };

  @Column({ default: false })
  isManualBoost: boolean;

  @Column({ type: 'float', default: 0 })
  manualBoostValue: number;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ nullable: true })
  dateStr: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, { nullable: true })
  operator: User;

  @Column({ nullable: true })
  operatorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
