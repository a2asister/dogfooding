import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm'
import { ObjectType, Field } from '@nestjs/graphql'
import { Drawing } from './drawing.entity'

@ObjectType()
@Entity()
export class Version {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Field()
  @Column('text')
  snapshot!: string

  @Field()
  @ManyToOne(() => Drawing, { onDelete: 'CASCADE' })
  drawing!: Drawing

  @Field()
  @CreateDateColumn()
  createdAt!: Date
}
