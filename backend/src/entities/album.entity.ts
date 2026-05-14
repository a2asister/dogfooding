import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Photo } from './photo.entity';

@Entity()
export class Album {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  cover?: string;

  @OneToMany(() => Photo, photo => photo.album, { cascade: true })
  photos!: Photo[];
}
