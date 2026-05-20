import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['callerService', 'calleeService', 'timestamp'])
@Index(['env', 'timestamp'])
export class ServiceDependency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  env: string;

  @Column({ length: 50 })
  callerService: string;

  @Column({ length: 50 })
  callerType: string;

  @Column({ length: 100, nullable: true })
  callerIp?: string;

  @Column({ type: 'int', nullable: true })
  callerPort?: number;

  @Column({ length: 50 })
  calleeService: string;

  @Column({ length: 50 })
  calleeType: string;

  @Column({ length: 100, nullable: true })
  calleeIp?: string;

  @Column({ type: 'int', nullable: true })
  calleePort?: number;

  @Column({ length: 20 })
  callType: string;

  @Column({ type: 'int', default: 0 })
  callCount: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'float', default: 0 })
  errorRate: number;

  @Column({ type: 'float', default: 0 })
  avgDuration: number;

  @Column({ type: 'float', default: 0 })
  p95Duration: number;

  @Column({ type: 'float', default: 0 })
  p99Duration: number;

  @Column({ type: 'float', default: 0 })
  minDuration: number;

  @Column({ type: 'float', default: 0 })
  maxDuration: number;

  @CreateDateColumn()
  timestamp: Date;
}
