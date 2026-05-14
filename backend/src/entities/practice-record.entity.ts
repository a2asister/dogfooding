import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PracticeRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  characterId: string = '';

  @Column()
  character: string = '';

  @Column({ type: 'bigint' })
  timestamp: number = 0;

  @Column()
  correct: boolean = false;

  @Column('simple-json')
  errors: string[] = [];

  @Column()
  duration: number = 0;
}
