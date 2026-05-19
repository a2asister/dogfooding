import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from './User';

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('creator_reports')
@Index(['userId', 'reportType', 'periodStart'], { unique: true })
export class CreatorReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'simple-enum',
    enum: ReportType,
  })
  reportType: ReportType;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ default: 0 })
  totalViews: number;

  @Column({ default: 0 })
  totalLikes: number;

  @Column({ default: 0 })
  totalComments: number;

  @Column({ default: 0 })
  totalFavorites: number;

  @Column({ default: 0 })
  totalShares: number;

  @Column({ default: 0 })
  newFollowers: number;

  @Column({ default: 0 })
  lostFollowers: number;

  @Column({ default: 0 })
  netFollowers: number;

  @Column({ default: 0 })
  newNotes: number;

  @Column({ type: 'float', default: 0 })
  avgEngagementRate: number;

  @Column({ type: 'float', default: 0 })
  avgWatchTime: number;

  @Column({ type: 'float', default: 0 })
  fanGrowthRate: number;

  @Column({ default: 0 })
  totalEarnings: number;

  @Column({ type: 'simple-json', nullable: true })
  earningsBreakdown: {
    commission: number;
    tips: number;
    subscriptions: number;
    adRevenue: number;
    platformRewards: number;
    other: number;
  };

  @Column({ type: 'simple-json', nullable: true })
  topPerformingNotes: {
    noteId: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    engagementRate: number;
    earnings: number;
  }[];

  @Column({ type: 'simple-json', nullable: true })
  fanActivity: {
    activeFans: number;
    newFans: number;
    returningFans: number;
    fanDemographics: any;
    topInteractions: { userId: string; nickname: string; interactions: number }[];
  };

  @Column({ type: 'simple-json', nullable: true })
  trafficSources: {
    source: string;
    visits: number;
    percentage: number;
  }[];

  @Column({ type: 'simple-json', nullable: true })
  insights: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    opportunities: string[];
  };

  @Column({ type: 'simple-json', nullable: true })
  comparison: {
    viewsChange: number;
    likesChange: number;
    followersChange: number;
    earningsChange: number;
    engagementChange: number;
  };

  @CreateDateColumn()
  createdAt: Date;
}
