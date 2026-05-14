import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Character } from './character.entity';

@Entity()
export class Radical {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name: string = '';

  @Column()
  strokeCount: number = 0;

  @Column({ type: 'text', default: '' })
  pathData: string = '';

  @Column('simple-json')
  position: { x: number; y: number } = { x: 0, y: 0 };

  @Column({ default: false })
  isErrorProne: boolean = false;

  @ManyToOne(() => Character, (character) => character.radicals)
  character!: Character;
}
