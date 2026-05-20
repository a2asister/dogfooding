import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['appCode', 'level', 'timestamp'])
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  appCode: string;

  @Column({ length: 20 })
  env: string;

  @Column({ length: 20 })
  level: string;

  @Column({ length: 100, nullable: true })
  logger: string;

  @Column({ length: 100, nullable: true })
  thread: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  stackTrace: string | null;

  @Column({ length: 50, nullable: true })
  traceId: string;

  @Column({ length: 100, nullable: true })
  className: string;

  @Column({ type: 'int', nullable: true })
  lineNumber: number;

  @Column({ type: 'simple-json', nullable: true })
  extra: any;

  @CreateDateColumn()
  timestamp: Date;
}
