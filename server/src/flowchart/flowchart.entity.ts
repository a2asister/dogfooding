import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
@Entity()
export class Flowchart {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  name: string

  @Field(() => String)
  @Column('simple-json')
  nodes: string

  @Field(() => String)
  @Column('simple-json')
  connections: string

  @Field()
  @CreateDateColumn()
  createdAt: Date

  @Field()
  @UpdateDateColumn()
  updatedAt: Date
}
