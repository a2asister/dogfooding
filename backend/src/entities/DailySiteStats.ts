import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('daily_site_stats')
@Index(['date'], { unique: true })
export class DailySiteStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: Date;

  @Column({ default: 0 })
  totalUsers: number;

  @Column({ default: 0 })
  newUsers: number;

  @Column({ default: 0 })
  activeUsers: number;

  @Column({ default: 0 })
  pageViews: number;

  @Column({ default: 0 })
  uniqueVisitors: number;

  @Column({ default: 0 })
  newNotes: number;

  @Column({ default: 0 })
  totalNotes: number;

  @Column({ default: 0 })
  newComments: number;

  @Column({ default: 0 })
  newLikes: number;

  @Column({ default: 0 })
  newFavorites: number;

  @Column({ default: 0 })
  newFollows: number;

  @Column({ default: 0 })
  newShares: number;

  @Column({ default: 0 })
  totalRevenue: number;

  @Column({ default: 0 })
  paidUsers: number;

  @Column({ default: 0 })
  newOrders: number;

  @Column({ type: 'float', default: 0 })
  avgSessionDuration: number;

  @Column({ type: 'float', default: 0 })
  bounceRate: number;

  @Column({ type: 'simple-json', nullable: true })
  trafficSources: {
    direct: number;
    search: number;
    social: number;
    referral: number;
    email: number;
    other: number;
  };

  @Column({ type: 'simple-json', nullable: true })
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };

  @Column({ type: 'simple-json', nullable: true })
  browserStats: Record<string, number>;

  @Column({ type: 'simple-json', nullable: true })
  regionStats: Record<string, number>;

  @Column({ type: 'simple-json', nullable: true })
  retentionRates: {
    day1: number;
    day3: number;
    day7: number;
    day14: number;
    day30: number;
  };

  @Column({ type: 'simple-json', nullable: true })
  conversionFunnel: {
    visitorToUser: number;
    userToCreator: number;
    creatorToEarner: number;
    userToPaid: number;
  };

  @CreateDateColumn()
  createdAt: Date;
}
