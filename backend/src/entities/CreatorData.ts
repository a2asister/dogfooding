import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('creator_datas')
export class CreatorData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ unique: true })
  userId: string;

  @Column({ type: 'date' })
  date: Date;

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
  newNotes: number;

  @Column({ type: 'float', default: 0 })
  engagementRate: number;

  @Column({ type: 'simple-json', nullable: true })
  noteStats: {
    noteId: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    favorites: number;
  }[];

  @Column({ type: 'simple-json', nullable: true })
  fanDemographics: {
    gender?: { male: number; female: number; unknown: number };
    age?: { [key: string]: number };
    location?: { [key: string]: number };
    interests?: { [key: string]: number };
  };

  @CreateDateColumn()
  createdAt: Date;
}
