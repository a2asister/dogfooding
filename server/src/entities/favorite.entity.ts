import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Element } from './element.entity';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @ManyToOne(() => Element, (element) => element.favorites)
  element!: Element;

  @Column()
  elementId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
