import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

export enum UserRestrictionType {
  MUTE = 'mute',
  FLOW_LIMIT = 'flow_limit',
  BAN = 'ban',
  WARNING = 'warning',
}

export enum UserRestrictionScope {
  COMMENT = 'comment',
  POST = 'post',
  ALL = 'all',
}

@Entity('user_restrictions')
export class UserRestriction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'simple-enum', enum: UserRestrictionType })
  type: UserRestrictionType;

  @Column({ type: 'simple-enum', enum: UserRestrictionScope, default: UserRestrictionScope.ALL })
  scope: UserRestrictionScope;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'simple-json', nullable: true })
  evidence: {
    type: string;
    description: string;
    url?: string;
  }[];

  @ManyToOne(() => User, { nullable: true })
  operator: User;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  isPermanent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  liftedAt: Date;

  @Column({ nullable: true })
  liftedReason: string;
}
