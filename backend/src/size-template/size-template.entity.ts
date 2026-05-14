import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SizeTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float')
  width: number;

  @Column('float')
  height: number;

  @Column()
  unit: string;
}
