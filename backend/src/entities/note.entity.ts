import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  characterId: string = '';

  @Column({ type: 'text' })
  content: string = '';

  @Column({ type: 'bigint' })
  timestamp: number = 0;
}
