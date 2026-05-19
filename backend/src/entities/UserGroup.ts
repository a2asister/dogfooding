import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';

export enum GroupType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  DYNAMIC = 'dynamic',
}

@Entity('user_groups')
export class UserGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: GroupType,
    default: GroupType.AUTOMATIC,
  })
  type: GroupType;

  @Column({ type: 'simple-json', nullable: true })
  conditions: {
    minFollowers?: number;
    maxFollowers?: number;
    minNotes?: number;
    minEngagementRate?: number;
    registrationDays?: number;
    lastActiveDays?: number;
    userTags?: string[];
    excludeTags?: string[];
    locations?: string[];
    ageRange?: { min: number; max: number };
    genders?: string[];
    hasMembership?: boolean;
    minTotalEarnings?: number;
  };

  @Column({ default: 0 })
  userCount: number;

  @Column({ type: 'simple-json', nullable: true })
  features: {
    exclusiveContent?: boolean;
    prioritySupport?: boolean;
    specialBadge?: string;
    discountRate?: number;
    earlyAccess?: boolean;
  };

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_group_members',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
