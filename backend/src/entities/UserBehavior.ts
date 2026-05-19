import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Note } from './Note';

export enum BehaviorType {
  VIEW = 'view',
  LIKE = 'like',
  UNLIKE = 'unlike',
  FAVORITE = 'favorite',
  UNFAVORITE = 'unfavorite',
  COMMENT = 'comment',
  SHARE = 'share',
  SEARCH = 'search',
  FOLLOW = 'follow',
  UNFOLLOW = 'unfollow',
  TOPIC_FOLLOW = 'topic_follow',
  DISLIKE = 'dislike',
  REPORT = 'report',
}

@Entity('user_behaviors')
export class UserBehavior {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'simple-enum', enum: BehaviorType })
  behaviorType: BehaviorType;

  @Column({ nullable: true })
  targetType: string;

  @Column({ nullable: true })
  targetId: string;

  @ManyToOne(() => Note, { nullable: true })
  note: Note;

  @Column({ nullable: true })
  noteId: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    duration?: number;
    scrollDepth?: number;
    keyword?: string;
    source?: string;
    extra?: Record<string, any>;
  };

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ default: false })
  isProcessed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
