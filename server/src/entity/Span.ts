import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['traceId', 'timestamp'])
@Index(['spanId', 'timestamp'])
@Index(['parentSpanId', 'timestamp'])
@Index(['serviceName', 'timestamp'])
export class Span {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  traceId: string;

  @Column({ length: 64, unique: true })
  spanId: string;

  @Column({ length: 64, nullable: true })
  parentSpanId?: string;

  @Column({ length: 50 })
  serviceName: string;

  @Column({ length: 10 })
  serviceType: string;

  @Column({ length: 100, nullable: true })
  serviceIp?: string;

  @Column({ type: 'int', nullable: true })
  servicePort?: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  kind: string;

  @Column({ type: 'bigint' })
  startTime: number;

  @Column({ type: 'bigint' })
  endTime: number;

  @Column({ type: 'bigint' })
  duration: number;

  @Column({ type: 'boolean', default: false })
  hasError: boolean;

  @Column({ length: 500, nullable: true })
  errorMessage?: string;

  @Column({ type: 'text', nullable: true })
  stackTrace?: string;

  @Column({ length: 20, nullable: true })
  protocol?: string;

  @Column({ length: 50, nullable: true })
  component?: string;

  @Column({ type: 'simple-json', nullable: true })
  requestParams?: any;

  @Column({ type: 'simple-json', nullable: true })
  responseData?: any;

  @Column({ type: 'simple-json', nullable: true })
  attributes?: any;

  @Column({ length: 50, nullable: true })
  dbType?: string;

  @Column({ length: 500, nullable: true })
  dbStatement?: string;

  @Column({ length: 100, nullable: true })
  mqTopic?: string;

  @Column({ length: 20, nullable: true })
  callType?: string;

  @Column({ length: 50, nullable: true })
  region?: string;

  @CreateDateColumn()
  timestamp: Date;
}
