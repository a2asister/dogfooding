import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'course' })
export class CourseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  duration!: number;

  @Column()
  calories!: number;

  @Column()
  difficulty!: string;

  @Column()
  thumbnail!: string;
}
