import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from './User';
import { MembershipPlan } from './MembershipPlan';
import { Order } from './Order';

export enum UserMembershipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

@Entity('user_memberships')
@Index(['userId', 'status', 'expiresAt'])
export class UserMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => MembershipPlan)
  plan: MembershipPlan;

  @Column()
  planId: string;

  @Column({
    type: 'simple-enum',
    enum: UserMembershipStatus,
    default: UserMembershipStatus.ACTIVE,
  })
  status: UserMembershipStatus;

  @Column()
  startDate: Date;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  autoRenew: boolean;

  @ManyToOne(() => Order, { nullable: true })
  order: Order;

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'simple-json', nullable: true })
  features: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
