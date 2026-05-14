import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Note } from './note.entity';

@Entity()
export class KnowledgeCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ default: '#6366f1' })
  color!: string;

  @OneToMany(() => Note, (note) => note.category)
  notes!: Note[];
}
