import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['appCode', 'path', 'timestamp'])
@Index(['env', 'timestamp'])
export class ApiMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  appCode: string;

  @Column({ length: 20 })
  env: string;

  @Column({ length: 10 })
  method: string;

  @Column({ length: 500 })
  path: string;

  @Column({ type: 'int', default: 0 })
  requestCount: number;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'float', default: 0 })
  errorRate: number;

  @Column({ type: 'float', default: 0 })
  qps: number;

  @Column({ type: 'float', default: 0 })
  avgDuration: number;

  @Column({ type: 'float', default: 0 })
  p50Duration: number;

  @Column({ type: 'float', default: 0 })
  p75Duration: number;

  @Column({ type: 'float', default: 0 })
  p95Duration: number;

  @Column({ type: 'float', default: 0 })
  p99Duration: number;

  @Column({ type: 'float', default: 0 })
  minDuration: number;

  @Column({ type: 'float', default: 0 })
  maxDuration: number;

  @Column({ type: 'text', nullable: true })
  topSlowSpans?: string;

  @Column({ type: 'text', nullable: true })
  topErrors?: string;

  @CreateDateColumn()
  timestamp: Date;
}
