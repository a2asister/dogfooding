import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

export enum AccountRiskType {
  ABNORMAL_LOGIN = 'abnormal_login',
  SUSPICIOUS_REGISTRATION = 'suspicious_registration',
  BATCH_REGISTRATION = 'batch_registration',
  STOLEN_ACCOUNT = 'stolen_account',
  MONEY_LAUNDERING = 'money_laundering',
  FRAUD = 'fraud',
}

export enum AccountRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AccountRiskStatus {
  DETECTED = 'detected',
  REVIEWING = 'reviewing',
  CONFIRMED = 'confirmed',
  DISMISSED = 'dismissed',
  PROCESSED = 'processed',
}

export enum AccountAction {
  NONE = 'none',
  WARNING = 'warning',
  FORCE_VERIFY = 'force_verify',
  TEMP_LOCK = 'temp_lock',
  PERM_BAN = 'perm_ban',
}

@Entity('account_risks')
export class AccountRisk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-enum', enum: AccountRiskType })
  type: AccountRiskType;

  @Column({ type: 'simple-enum', enum: AccountRiskLevel })
  level: AccountRiskLevel;

  @Column({ type: 'simple-enum', enum: AccountRiskStatus, default: AccountRiskStatus.DETECTED })
  status: AccountRiskStatus;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'simple-enum', enum: AccountAction, default: AccountAction.NONE })
  actionTaken: AccountAction;

  @Column({ type: 'simple-json' })
  evidence: {
    rule: string;
    description: string;
    metrics: Record<string, any>;
    ipAddresses?: string[];
    locations?: string[];
    timestamps?: string[];
  };

  @Column({ type: 'float', default: 0 })
  confidence: number;

  @Column({ type: 'simple-json', nullable: true })
  loginDetails: {
    ip: string;
    location: string;
    device: string;
    loginTime: string;
    isNewDevice: boolean;
    isNewLocation: boolean;
  };

  @Column({ type: 'simple-json', nullable: true })
  batchDetails: {
    batchId: string;
    relatedAccountIds: string[];
    registrationTimeWindow: number;
    sharedAttributes: string[];
  };

  @ManyToOne(() => User, { nullable: true })
  reviewer: User;

  @Column({ nullable: true })
  reviewerId: string;

  @Column({ type: 'text', nullable: true })
  reviewNote: string;

  @CreateDateColumn()
  detectedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  processedAt: Date;
}
