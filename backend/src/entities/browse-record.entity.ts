import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity()
export class BrowseRecord {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  houseId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userId?: string;

  @Field()
  @Column({ default: '' })
  ipAddress: string;

  @Field()
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  browseTime: Date;
}
