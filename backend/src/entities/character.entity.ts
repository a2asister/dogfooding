import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Radical } from './radical.entity';

@Entity()
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  char: string = '';

  @Column()
  pinyin: string = '';

  @Column()
  meaning: string = '';

  @Column()
  totalStrokes: number = 0;

  @Column()
  structure: string = '';

  @OneToMany(() => Radical, (radical) => radical.character, { cascade: true })
  radicals!: Radical[];
}
