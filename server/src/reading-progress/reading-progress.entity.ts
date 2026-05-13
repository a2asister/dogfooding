import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Book } from '../book/book.entity';
import { User } from '../user/user.entity';

@ObjectType()
@Entity()
export class ReadingProgress {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => Int)
  @Column({ default: 0 })
  currentPage!: number;

  @Field(() => Boolean)
  @Column({ default: false })
  isBookmarked!: boolean;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Field(() => Book)
  @ManyToOne(() => Book, (book) => book.readingProgresses, { onDelete: 'CASCADE' })
  book!: Book;

  @Field()
  @Column()
  bookId!: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.readingProgresses, { onDelete: 'CASCADE' })
  user!: User;

  @Field()
  @Column()
  userId!: string;
}
