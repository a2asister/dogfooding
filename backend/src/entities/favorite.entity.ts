import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'favorite' })
export class FavoriteEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  courseId!: number;
}
