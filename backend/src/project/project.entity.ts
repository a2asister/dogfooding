import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Subtitle } from '../subtitle/subtitle.entity';

@ObjectType()
@Entity()
export class Project {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  audioFile?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  backgroundColor?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  videoWidth?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  videoHeight?: number;

  @Field(() => [Subtitle], { nullable: true })
  @OneToMany(() => Subtitle, (subtitle) => subtitle.project, { cascade: true })
  subtitles?: Subtitle[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
