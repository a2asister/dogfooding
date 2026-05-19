import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserTierLevel {
  NEW = 'new',
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  INFLUENCER = 'influencer',
}

@Entity('user_tiers')
export class UserTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'simple-enum',
    enum: UserTierLevel,
    unique: true,
  })
  level: UserTierLevel;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  minFollowers: number;

  @Column({ default: 0 })
  minNotes: number;

  @Column({ type: 'float', default: 0 })
  minEngagementRate: number;

  @Column({ default: 0 })
  minTotalViews: number;

  @Column({ type: 'simple-json', nullable: true })
  benefits: {
    commissionRateBonus?: number;
    promotionDiscount?: number;
    prioritySupport?: boolean;
    exclusiveEvents?: boolean;
    betaFeatures?: boolean;
    dedicatedManager?: boolean;
    revenueGuarantee?: number;
  };

  @Column({ nullable: true })
  badgeIcon: string;

  @Column({ nullable: true })
  badgeColor: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
