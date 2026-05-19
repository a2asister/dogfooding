import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserMembership } from './UserMembership';

export enum MembershipPlanType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
}

export enum MembershipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
}

@Entity('membership_plans')
export class MembershipPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: MembershipPlanType,
  })
  planType: MembershipPlanType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountPrice: number;

  @Column({ default: 0 })
  durationDays: number;

  @Column({ type: 'simple-json', nullable: true })
  features: {
    adFree?: boolean;
    prioritySupport?: boolean;
    exclusiveContent?: boolean;
    customProfile?: boolean;
    verifiedBadge?: boolean;
    higherCommissionRate?: boolean;
    promotionDiscount?: number;
    maxDailyNotes?: number;
    maxStorageGB?: number;
    analyticsAccess?: boolean;
    earlyAccess?: boolean;
  };

  @Column({ type: 'simple-json', nullable: true })
  perks: string[];

  @Column({
    type: 'simple-enum',
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  badgeIcon: string;

  @Column({ nullable: true })
  badgeText: string;

  @Column({ default: false })
  isPopular: boolean;

  @Column({ default: false })
  isRecommended: boolean;

  @OneToMany(() => UserMembership, (userMembership) => userMembership.plan)
  userMemberships: UserMembership[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
