import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './Role';

export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ type: 'simple-enum', enum: AdminStatus, default: AdminStatus.ACTIVE })
  status: AdminStatus;

  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column({ default: 0 })
  loginCount: number;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  @ManyToMany(() => Role, (role) => role.admins)
  @JoinTable({
    name: 'admin_roles',
    joinColumn: { name: 'admin_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
