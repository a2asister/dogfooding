import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

export enum FileStatus {
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@ObjectType()
@Entity()
export class FileEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  filename: string;

  @Field()
  @Column()
  originalName: string;

  @Field()
  @Column()
  mimeType: string;

  @Field()
  @Column('bigint')
  size: number;

  @Field()
  @Column('int', { default: 0 })
  uploadedChunks: number;

  @Field()
  @Column('int', { default: 0 })
  totalChunks: number;

  @Field()
  @Column({
    type: 'simple-enum',
    enum: FileStatus,
    default: FileStatus.UPLOADING,
  })
  status: FileStatus;

  @Field()
  @Column({ nullable: true })
  filePath?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
