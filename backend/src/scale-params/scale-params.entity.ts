import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ScaleParams {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  unit: string;

  @Column('int')
  pixelsPerUnit: number;
}
