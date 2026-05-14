import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ColorPalette {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('simple-json')
  colors!: string[];

  @CreateDateColumn()
  createdAt!: Date;
}
