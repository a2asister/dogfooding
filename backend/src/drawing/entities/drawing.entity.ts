import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ObjectType, Field } from '@nestjs/graphql'
import { DrawingPath } from './path.entity'

@ObjectType()
@Entity()
export class Drawing {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Field()
  @Column()
  name!: string

  @Field(() => [DrawingPath])
  @OneToMany(() => DrawingPath, (path) => path.drawing, { cascade: true, eager: true })
  paths!: DrawingPath[]

  @Field()
  @CreateDateColumn()
  createdAt!: Date

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date
}
