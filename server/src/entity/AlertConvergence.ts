import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['ruleId', 'groupKey'])
export class AlertConvergence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  ruleId: number;

  @Column({ length: 50 })
  ruleName: string;

  @Column({ length: 100 })
  groupKey: string;

  @Column({ length: 50 })
  groupField: string;

  @Column({ type: 'int', default: 0 })
  alertCount: number;

  @Column({ type: 'int', default: 0 })
  triggerCount: number;

  @Column({ type: 'boolean', default: false })
  isConverged: boolean;

  @Column({ type: 'text', nullable: true })
  convergedAlertIds?: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @CreateDateColumn()
  firstAlertTime: Date;

  @Column({ type: 'datetime', nullable: true })
  lastAlertTime?: Date;

  @Column({ type: 'datetime', nullable: true })
  nextNotifyTime?: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
