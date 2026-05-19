import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

export enum LoginStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  SUSPICIOUS = 'suspicious',
}

@Entity('login_logs')
export class LoginLog {
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

  @Column({ type: 'simple-enum', enum: LoginStatus })
  status: LoginStatus;

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
  isNewDevice: boolean;

  @Column({ default: false })
  isNewLocation: boolean;

  @Column({ default: false })
  isRisky: boolean;

  @Column({ type: 'simple-json', nullable: true })
  riskFlags: string[];

  @CreateDateColumn()
  createdAt: Date;
}
