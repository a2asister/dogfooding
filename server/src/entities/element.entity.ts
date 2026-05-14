import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Favorite } from './favorite.entity';
import { Note } from './note.entity';

@Entity()
export class Element {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  atomicNumber!: number;

  @Column({ unique: true, length: 10 })
  symbol!: string;

  @Column()
  name!: string;

  @Column({ type: 'real', nullable: true })
  atomicMass?: number;

  @Column({ length: 50, nullable: true })
  category?: string;

  @Column({ nullable: true })
  group?: number;

  @Column({ nullable: true })
  period?: number;

  @Column({ length: 50, nullable: true })
  electronConfiguration?: string;

  @Column({ type: 'real', nullable: true })
  electronegativity?: number;

  @Column({ type: 'real', nullable: true })
  meltingPoint?: number;

  @Column({ type: 'real', nullable: true })
  boilingPoint?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 20, nullable: true })
  color?: string;

  @OneToMany(() => Favorite, (favorite) => favorite.element)
  favorites!: Favorite[];

  @OneToMany(() => Note, (note) => note.element)
  notes!: Note[];
}
