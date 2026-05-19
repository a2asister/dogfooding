import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from './User';
import { Order } from './Order';

export enum EarningType {
  COMMISSION = 'commission',
  AD_REVENUE = 'ad_revenue',
  TIP = 'tip',
  SUBSCRIPTION = 'subscription',
  PLATFORM_REWARD = 'platform_reward',
  REFERRAL_BONUS = 'referral_bonus',
}

export enum EarningStatus {
  PENDING = 'pending',
  AVAILABLE = 'available',
  SETTLED = 'settled',
  CANCELLED = 'cancelled',
}

@Entity('earnings')
@Index(['userId', 'status', 'createdAt'])
export class Earning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'simple-enum',
    enum: EarningType,
  })
  type: EarningType;

  @Column({
    type: 'simple-enum',
    enum: EarningStatus,
    default: EarningStatus.PENDING,
  })
  status: EarningStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Order, { nullable: true })
  order: Order;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  sourceId: string;

  @Column({ nullable: true })
  sourceType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ nullable: true })
  settlementDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
