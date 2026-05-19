import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('traffic_sources')
@Index(['source', 'medium', 'date'])
export class TrafficSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  source: string;

  @Column()
  medium: string;

  @Column({ nullable: true })
  campaign: string;

  @Column({ nullable: true })
  keyword: string;

  @Column({ nullable: true })
  referralUrl: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 0 })
  visits: number;

  @Column({ default: 0 })
  uniqueVisitors: number;

  @Column({ default: 0 })
  newUsers: number;

  @Column({ default: 0 })
  pageViews: number;

  @Column({ default: 0 })
  bounces: number;

  @Column({ type: 'float', default: 0 })
  avgSessionDuration: number;

  @Column({ type: 'float', default: 0 })
  conversionRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenue: number;

  @CreateDateColumn()
  createdAt: Date;
}
