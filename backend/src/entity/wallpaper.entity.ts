import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Wallpaper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  filePath!: string;

  @Column({ nullable: true })
  originalWidth?: number;

  @Column({ nullable: true })
  originalHeight?: number;

  @Column('simple-json', { nullable: true })
  adaptationParams?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}