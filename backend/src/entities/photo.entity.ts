import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Album } from './album.entity';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  url!: string;

  @Column()
  title!: string;

  @Column({ default: 1 })
  depth!: number;

  @Column()
  albumId!: number;

  @ManyToOne(() => Album, album => album.photos)
  @JoinColumn({ name: 'albumId' })
  album!: Album;
}
