import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';
import { Favorite } from './favorite.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column('decimal')
  price!: number;

  @Column('simple-array')
  images!: string[];

  @Column({ default: true })
  isAvailable!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Category, (category) => category.products)
  category!: Category;

  @ManyToOne(() => User, (user) => user.products)
  seller!: User;

  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites!: Favorite[];
}
