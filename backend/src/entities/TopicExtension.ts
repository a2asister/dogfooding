import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Topic } from './Topic';

export enum TopicReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('topic_extensions')
export class TopicExtension {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  topicId: string;

  @OneToOne(() => Topic)
  @JoinColumn({ name: 'topicId' })
  topic: Topic;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 0 })
  postCount: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  interactionCount: number;

  @Column({ type: 'simple-json', nullable: true })
  tags: string[];

  @Column({ type: 'simple-json', nullable: true })
  relatedTopics: string[];

  @Column({ type: 'simple-enum', enum: TopicReviewStatus, default: TopicReviewStatus.APPROVED })
  reviewStatus: TopicReviewStatus;

  @Column({ default: false })
  isOfficial: boolean;

  @Column({ default: false })
  isRecommend: boolean;

  @Column({ default: 0 })
  sortWeight: number;

  @Column({ type: 'simple-json', nullable: true })
  moderationRules: {
    allowAdultContent: boolean;
    allowPoliticalContent: boolean;
    allowAdvertising: boolean;
    requireReview: boolean;
  };

  @Column({ type: 'simple-json', nullable: true })
  stats: {
    dailyPosts: number;
    weeklyPosts: number;
    monthlyPosts: number;
    activeUsers: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
