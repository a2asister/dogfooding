import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['hostId', 'timestamp'])
export class HostMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hostId: number;

  @Column({ type: 'float', default: 0 })
  cpuUsage: number;

  @Column({ type: 'float', default: 0 })
  memoryUsage: number;

  @Column({ type: 'float', default: 0 })
  memoryUsed: number;

  @Column({ type: 'float', default: 0 })
  diskUsage: number;

  @Column({ type: 'float', default: 0 })
  diskUsed: number;

  @Column({ type: 'float', default: 0 })
  networkIn: number;

  @Column({ type: 'float', default: 0 })
  networkOut: number;

  @Column({ type: 'float', default: 0 })
  loadAverage: number;

  @Column({ type: 'int', default: 0 })
  processCount: number;

  @CreateDateColumn()
  timestamp: Date;
}
