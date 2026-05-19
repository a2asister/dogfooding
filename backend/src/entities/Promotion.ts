import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Note } from './Note';
import { User } from './User';
import { Order } from './Order';

export enum PromotionPlanType {
  VIEWS_BOOST = 'views_boost',
  LIKES_BOOST = 'likes_boost',
  FOLLOWERS_BOOST = 'followers_boost',
  HOT_RANK_BOOST = 'hot_rank_boost',
  HOMEPAGE_FEATURE = 'homepage_feature',
  TOPIC_PIN = 'topic_pin',
}

export enum PromotionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export enum PromotionTargetAudience {
  ALL = 'all',
  FOLLOWERS = 'followers',
  SIMILAR_INTERESTS = 'similar_interests',
  BY_TAGS = 'by_tags',
  BY_LOCATION = 'by_location',
  BY_AGE = 'by_age',
  BY_GENDER = 'by_gender',
}

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Note)
  note: Note;

  @Column()
  noteId: string;

  @Column({
    type: 'simple-enum',
    enum: PromotionPlanType,
  })
  planType: PromotionPlanType;

  @Column({
    type: 'simple-enum',
    enum: PromotionStatus,
    default: PromotionStatus.PENDING,
  })
  status: PromotionStatus;

  @Column({
    type: 'simple-enum',
    enum: PromotionTargetAudience,
    default: PromotionTargetAudience.ALL,
  })
  targetAudience: PromotionTargetAudience;

  @Column({ type: 'simple-json', nullable: true })
  targetFilters: {
    tags?: string[];
    locations?: string[];
    ageRange?: { min: number; max: number };
    gender?: string;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  spent: number;

  @Column({ default: 0 })
  targetViews: number;

  @Column({ default: 0 })
  deliveredViews: number;

  @Column({ default: 0 })
  achievedLikes: number;

  @Column({ default: 0 })
  achievedFollows: number;

  @Column({ default: 0 })
  achievedComments: number;

  @Column({ default: 0 })
  ctr: number;

  @Column({ default: 24 })
  durationHours: number;

  @Column({ default: 1.0 })
  boostMultiplier: number;

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @ManyToOne(() => Order, { nullable: true })
  order: Order;

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
