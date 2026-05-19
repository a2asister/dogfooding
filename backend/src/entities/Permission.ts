import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Role } from './Role';

export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'simple-enum', enum: PermissionType, default: PermissionType.API })
  type: PermissionType;

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  sort: number;

  @ManyToOne(() => Permission, { nullable: true })
  parent: Permission;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => Permission, (permission) => permission.parent)
  children: Permission[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
