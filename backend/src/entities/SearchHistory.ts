import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('search_histories')
export class SearchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  keyword: string;

  @Column({ default: 1 })
  searchCount: number;

  @ManyToOne(() => User, (user) => user.searchHistories, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
