import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ErrorCharacter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  characterId: string = '';

  @Column()
  character: string = '';

  @Column({ default: 0 })
  errorCount: number = 0;

  @Column({ type: 'bigint' })
  lastError: number = 0;
}
