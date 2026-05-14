import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import type { FissionConfig } from '../types/geometric';

@Entity('saved_works')
export class SavedWork {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('simple-json')
  config!: FissionConfig;

  @Column({ default: '' })
  thumbnail!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
