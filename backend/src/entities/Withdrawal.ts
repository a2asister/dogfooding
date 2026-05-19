import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Earning } from './Earning';

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum WithdrawalMethod {
  BANK_TRANSFER = 'bank_transfer',
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  PLATFORM_BALANCE = 'platform_balance',
}

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'simple-enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status: WithdrawalStatus;

  @Column({
    type: 'simple-enum',
    enum: WithdrawalMethod,
  })
  method: WithdrawalMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualAmount: number;

  @Column({ type: 'simple-json', nullable: true })
  accountInfo: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    wechatId?: string;
    alipayId?: string;
  };

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'text', nullable: true })
  rejectReason: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  processor: User;

  @Column({ nullable: true })
  processorId: string;

  @CreateDateColumn()
  createdAt: Date;
}
