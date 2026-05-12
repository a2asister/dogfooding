import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'
import { ObjectType, Field, ID, Int } from '@nestjs/graphql'

@ObjectType()
@Entity()
export class Artwork {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  text: string

  @Field()
  @Column('text')
  imageData: string

  @Field(() => Int)
  @Column()
  fontSize: number

  @Field(() => Int)
  @Column()
  particleSize: number

  @Field()
  @Column()
  colorStart: string

  @Field()
  @Column()
  colorEnd: string

  @Field()
  @Column({ default: '默认' })
  category: string

  @Field(() => Int)
  @Column({ default: 0 })
  likes: number

  @Field()
  @Column({ default: false })
  isLiked: boolean

  @Field()
  @Column({ default: false })
  isFavorited: boolean

  @Field()
  @CreateDateColumn()
  createdAt: Date
}
