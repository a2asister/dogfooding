import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ReadingProgress } from '../reading-progress/reading-progress.entity';
import { User } from '../user/user.entity';

@ObjectType()
@Entity()
export class Book {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column()
  title!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column()
  coverImage!: string;

  @Field(() => [String])
  @Column('simple-json')
  pages!: string[];

  @Field(() => Int)
  @Column({ default: 0 })
  totalPages!: number;

  @Field()
  @Column()
  author!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  category?: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isPublic!: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  shareCode?: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isShared!: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userId?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.books, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Field(() => [ReadingProgress], { nullable: true })
  @OneToMany(() => ReadingProgress, (progress) => progress.book)
  readingProgresses?: ReadingProgress[];
}
