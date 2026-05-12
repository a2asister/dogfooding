import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm'
import { ObjectType, Field } from '@nestjs/graphql'
import { Drawing } from './drawing.entity'

@ObjectType()
@Entity()
export class DrawingPath {
  @Field()
  @PrimaryColumn()
  id!: string

  @Field()
  @Column('text')
  pathData!: string

  @Field()
  @Column()
  strokeColor!: string

  @Field()
  @Column('float')
  strokeWidth!: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  fillColor?: string

  @ManyToOne(() => Drawing, (drawing) => drawing.paths, { onDelete: 'CASCADE' })
  drawing!: Drawing
}
