import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Survey } from '../survey/survey.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  role: string; // admin or user

  @OneToMany(() => Survey, survey => survey.creator)
  surveys: Survey[];
}