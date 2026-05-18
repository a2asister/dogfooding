import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { CollectionItem } from './CollectionItem';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ default: 0 })
  itemCount: number;

  @Column({ default: false })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.collections)
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => CollectionItem, (item) => item.collection)
  items: CollectionItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
