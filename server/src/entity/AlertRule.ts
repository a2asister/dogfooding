import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class AlertRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  metric: string;

  @Column({ length: 50, nullable: true })
  targetType?: string;

  @Column({ length: 50, nullable: true })
  targetId?: string;

  @Column({ length: 10 })
  operator: string;

  @Column({ type: 'float' })
  threshold: number;

  @Column({ type: 'int', default: 60 })
  duration: number;

  @Column({ length: 20, default: 'warning' })
  level: string;

  @Column({ type: 'text', nullable: true })
  notificationChannels?: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ length: 255, nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
