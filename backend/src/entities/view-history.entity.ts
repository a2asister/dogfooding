import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ViewHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  photoId!: number;

  @Column()
  photoUrl!: string;

  @Column()
  photoTitle!: string;

  @CreateDateColumn()
  viewedAt!: Date;
}
