import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('hot_searches')
export class HotSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  keyword: string;

  @Column({ default: 0 })
  searchCount: number;

  @Column({ default: 0 })
  sort: number;

  @Column({ default: false })
  isHot: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
