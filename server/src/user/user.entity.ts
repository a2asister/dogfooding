import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ReadingProgress } from '../reading-progress/reading-progress.entity';
import { Book } from '../book/book.entity';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column()
  nickname!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar?: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => [ReadingProgress], { nullable: true })
  @OneToMany(() => ReadingProgress, (progress) => progress.user)
  readingProgresses?: ReadingProgress[];

  @Field(() => [Book], { nullable: true })
  @OneToMany(() => Book, (book) => book.user)
  books?: Book[];
}
