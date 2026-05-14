import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class UserPreference {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @Column('simple-json')
  wallpaperParams!: Record<string, any>;

  @Column('simple-json', { nullable: true })
  customEffects?: Record<string, any>;

  @Column({ nullable: true })
  lastWallpaperId?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}