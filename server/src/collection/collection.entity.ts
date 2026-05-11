import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Index()
  @Column()
  characterId: string;

  @Column({ default: false })
  isCollected: boolean;

  @Column({ default: 0 })
  count: number;

  @CreateDateColumn()
  collectedAt: Date;
}
