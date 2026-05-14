import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'checkin' })
export class CheckinEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  courseId!: number;

  @Column()
  courseName!: string;

  @Column()
  date!: string;

  @Column()
  duration!: number;
}
