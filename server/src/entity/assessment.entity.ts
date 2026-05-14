import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Answer } from './answer.entity';

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('json')
  result: {
    temperament: string;
    tags: string[];
    scores: Record<string, number>;
    description: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Answer, (answer) => answer.assessment)
  answers: Answer[];
}
