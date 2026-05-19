import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Note } from './Note';

export enum RecommendStrategy {
  HOT = 'hot',
  PERSONALIZED = 'personalized',
  COLD_START = 'cold_start',
  FOLLOWING = 'following',
  TOPIC = 'topic',
  NEARBY = 'nearby',
  MIXED = 'mixed',
}

@Entity('recommend_records')
export class RecommendRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => Note)
  note: Note;

  @Column()
  noteId: string;

  @Column({ type: 'simple-enum', enum: RecommendStrategy })
  strategy: RecommendStrategy;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'simple-json', nullable: true })
  factors: {
    tagMatchScore?: number;
    hotScore?: number;
    coldStartBoost?: number;
    followBoost?: number;
    topicBoost?: number;
    diversityPenalty?: number;
  };

  @Column({ default: 0 })
  position: number;

  @Column({ default: false })
  isClicked: boolean;

  @Column({ default: false })
  isLiked: boolean;

  @Column({ default: false })
  isCommented: boolean;

  @Column({ default: false })
  isFavorited: boolean;

  @Column({ default: 0 })
  viewDuration: number;

  @CreateDateColumn()
  recommendedAt: Date;

  @Column({ nullable: true })
  interactedAt: Date;
}
