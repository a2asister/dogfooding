import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['type', 'enabled'])
export class AlertChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 20 })
  type: string;

  @Column({ type: 'simple-json' })
  config: any;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ length: 20, default: 'normal' })
  level: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
