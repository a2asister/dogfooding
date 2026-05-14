import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import type { FissionConfig } from '../types/geometric';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('simple-json')
  config!: FissionConfig;

  @Column({ default: '' })
  thumbnail!: string;

  @Column({ default: '自定义' })
  category!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
