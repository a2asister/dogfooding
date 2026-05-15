import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('history')
export class HistoryEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  pathId: string;

  @Column()
  action: string;

  @Column('simple-json', { nullable: true })
  beforeData: {
    id: string;
    name: string;
    points: Array<{ id: string; x: number; y: number; isControl?: boolean }>;
    createdAt: number;
    updatedAt: number;
  } | null;

  @Column('simple-json')
  afterData: {
    id: string;
    name: string;
    points: Array<{ id: string; x: number; y: number; isControl?: boolean }>;
    createdAt: number;
    updatedAt: number;
  };

  @CreateDateColumn()
  timestamp: number;
}