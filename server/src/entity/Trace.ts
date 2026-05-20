import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['traceId', 'timestamp'])
@Index(['appCode', 'timestamp'])
@Index(['userId', 'timestamp'])
export class Trace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, unique: true })
  traceId: string;

  @Column({ length: 50 })
  appCode: string;

  @Column({ length: 20 })
  env: string;

  @Column({ length: 50, nullable: true })
  userId?: string;

  @Column({ length: 20 })
  serviceName: string;

  @Column({ length: 10 })
  serviceType: string;

  @Column({ length: 100, nullable: true })
  serviceIp?: string;

  @Column({ type: 'int', nullable: true })
  servicePort?: number;

  @Column({ length: 10 })
  method: string;

  @Column({ length: 500 })
  path: string;

  @Column({ type: 'int' })
  statusCode: number;

  @Column({ type: 'bigint' })
  duration: number;

  @Column({ type: 'boolean', default: false })
  hasError: boolean;

  @Column({ length: 500, nullable: true })
  errorMessage?: string;

  @Column({ type: 'simple-json', nullable: true })
  requestParams?: any;

  @Column({ type: 'simple-json', nullable: true })
  responseData?: any;

  @Column({ type: 'simple-json', nullable: true })
  attributes?: any;

  @Column({ type: 'int', default: 0 })
  spanCount: number;

  @Column({ type: 'int', default: 0 })
  errorSpanCount: number;

  @CreateDateColumn()
  timestamp: Date;
}
