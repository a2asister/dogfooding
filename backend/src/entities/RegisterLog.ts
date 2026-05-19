import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

export enum RegisterStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  PENDING_VERIFY = 'pending_verify',
}

@Entity('register_logs')
export class RegisterLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'simple-enum', enum: RegisterStatus })
  status: RegisterStatus;

  @Column({ type: 'text', nullable: true })
  failReason: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'simple-json', nullable: true })
  deviceInfo: {
    deviceId?: string;
    platform?: string;
    os?: string;
    browser?: string;
    appVersion?: string;
  };

  @Column({ default: false })
  isSuspicious: boolean;

  @Column({ type: 'simple-json', nullable: true })
  riskFlags: string[];

  @Column({ nullable: true })
  batchId: string;

  @CreateDateColumn()
  createdAt: Date;
}
