import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum Rarity {
  NORMAL = 'normal',
  RARE = 'rare',
  LEGENDARY = 'legendary',
}

@Entity()
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('text')
  imageUrl: string;

  @Column({
    type: 'text',
    enum: Rarity,
    default: Rarity.NORMAL,
  })
  rarity: Rarity;

  @Column()
  element: string;

  @Column('int', { default: 1 })
  gridPosition: number;

  @Column({ default: false })
  isUnlocked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
