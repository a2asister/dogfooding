import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Command {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  command: string;

  @Column('text')
  response: string;

  @Column({ default: false })
  isError: boolean;
}
