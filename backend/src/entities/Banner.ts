import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

export enum BannerPosition {
  HOME_TOP = 'home_top',
  HOME_MIDDLE = 'home_middle',
  DISCOVER = 'discover',
  TOPIC_SQUARE = 'topic_square',
}

export enum BannerType {
  URL = 'url',
  NOTE = 'note',
  TOPIC = 'topic',
  ACTIVITY = 'activity',
  USER = 'user',
  NONE = 'none',
}

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  image: string;

  @Column({ type: 'simple-enum', enum: BannerPosition })
  position: BannerPosition;

  @Column({ type: 'simple-enum', enum: BannerType, default: BannerType.NONE })
  type: BannerType;

  @Column({ nullable: true })
  targetId: string;

  @Column({ nullable: true })
  targetUrl: string;

  @Column({ default: 0 })
  sort: number;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ default: 0 })
  viewCount: number;

  @ManyToOne(() => User, { nullable: true })
  creator: User;

  @Column({ nullable: true })
  creatorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
