import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserTagRelation } from './UserTagRelation';

export enum UserTagCategory {
  INTEREST = 'interest',
  BEHAVIOR = 'behavior',
  DEMOGRAPHIC = 'demographic',
  CONTENT = 'content',
  CUSTOM = 'custom',
}

@Entity('user_tags')
export class UserTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'simple-enum', enum: UserTagCategory })
  category: UserTagCategory;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  userCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  rules: {
    type: 'browse' | 'search' | 'interaction' | 'duration';
    minCount?: number;
    minDuration?: number;
    timeWindow: number;
  };

  @OneToMany(() => UserTagRelation, (relation) => relation.tag)
  userRelations: UserTagRelation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
