import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Project } from '../project/project.entity';

@ObjectType()
@Entity()
export class Subtitle {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  text: string;

  @Field(() => Float)
  @Column('real')
  startTime: number;

  @Field(() => Float)
  @Column('real')
  endTime: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  color?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  fontSize?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fontFamily?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  animationType?: string;

  @Field(() => ID)
  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.subtitles, { onDelete: 'CASCADE' })
  project: Project;
}
