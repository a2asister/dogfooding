import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'
import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
@Entity()
export class CreationRecord {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  flowchartId: string

  @Field()
  @Column()
  action: string

  @Field()
  @CreateDateColumn()
  createdAt: Date
}
