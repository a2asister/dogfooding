import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['containerId', 'timestamp'])
export class ContainerMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  containerId: string;

  @Column({ type: 'float', default: 0 })
  cpuUsage: number;

  @Column({ type: 'float', default: 0 })
  memoryUsage: number;

  @Column({ type: 'float', default: 0 })
  memoryUsed: number;

  @Column({ type: 'float', default: 0 })
  networkIn: number;

  @Column({ type: 'float', default: 0 })
  networkOut: number;

  @Column({ type: 'float', default: 0 })
  diskRead: number;

  @Column({ type: 'float', default: 0 })
  diskWrite: number;

  @Column({ type: 'int', default: 0 })
  restartCount: number;

  @CreateDateColumn()
  timestamp: Date;
}
