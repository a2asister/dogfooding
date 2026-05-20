import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['appCode', 'timestamp'])
export class AppMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  appCode: string;

  @Column({ type: 'float', default: 0 })
  cpuUsage: number;

  @Column({ type: 'float', default: 0 })
  memoryUsage: number;

  @Column({ type: 'float', default: 0 })
  memoryUsed: number;

  @Column({ type: 'int', default: 0 })
  requestCount: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'float', default: 0 })
  errorRate: number;

  @Column({ type: 'float', default: 0 })
  avgResponseTime: number;

  @Column({ type: 'float', default: 0 })
  p95ResponseTime: number;

  @Column({ type: 'float', default: 0 })
  p99ResponseTime: number;

  @Column({ type: 'int', default: 0 })
  activeConnections: number;

  @Column({ type: 'int', default: 0 })
  threadCount: number;

  @Column({ type: 'float', default: 0 })
  heapUsed: number;

  @Column({ type: 'float', default: 0 })
  heapMax: number;

  @CreateDateColumn()
  timestamp: Date;
}
