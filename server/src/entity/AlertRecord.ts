import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['ruleId', 'status', 'createdAt'])
export class AlertRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ruleId: number;

  @Column({ length: 100 })
  ruleName: string;

  @Column({ length: 50 })
  metric: string;

  @Column({ type: 'float' })
  currentValue: number;

  @Column({ type: 'float' })
  threshold: number;

  @Column({ length: 10 })
  operator: string;

  @Column({ length: 20 })
  level: string;

  @Column({ length: 50, nullable: true })
  targetType?: string;

  @Column({ length: 50, nullable: true })
  targetId?: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ length: 100, nullable: true })
  handledBy?: string;

  @Column({ type: 'text', nullable: true })
  handleNote?: string;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
