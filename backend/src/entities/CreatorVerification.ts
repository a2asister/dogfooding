import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

export enum VerificationType {
  PERSONAL = 'personal',
  ORGANIZATION = 'organization',
  EXPERT = 'expert',
  CELEBRITY = 'celebrity',
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('creator_verifications')
export class CreatorVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'simple-enum', enum: VerificationType })
  type: VerificationType;

  @Column()
  realName: string;

  @Column({ nullable: true })
  idCard: string;

  @Column({ nullable: true })
  organizationName: string;

  @Column({ nullable: true })
  organizationLicense: string;

  @Column({ type: 'simple-json', nullable: true })
  materials: {
    type: string;
    url: string;
    description: string;
  }[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  status: VerificationStatus;

  @ManyToOne(() => User, { nullable: true })
  reviewer: User;

  @Column({ nullable: true })
  reviewerId: string;

  @Column({ type: 'text', nullable: true })
  reviewNote: string;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: 0 })
  level: number;

  @Column({ nullable: true })
  badgeIcon: string;

  @Column({ nullable: true })
  badgeText: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
