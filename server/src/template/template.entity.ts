import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'
import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
@Entity()
export class Template {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  name: string

  @Field()
  @Column()
  category: string

  @Field()
  @Column()
  description: string

  @Field(() => String)
  @Column('simple-json')
  previewData: string

  @Field()
  @CreateDateColumn()
  createdAt: Date
}
