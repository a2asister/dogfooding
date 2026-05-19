import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { Note } from './Note';

export enum CommunityType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only',
}

export enum CommunityRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  coverImage: string;

  @ManyToOne(() => User)
  owner: User;

  @Column()
  ownerId: string;

  @Column({
    type: 'simple-enum',
    enum: CommunityType,
    default: CommunityType.PUBLIC,
  })
  type: CommunityType;

  @Column({ default: 0 })
  memberCount: number;

  @Column({ default: 0 })
  postCount: number;

  @Column({ type: 'simple-json', nullable: true })
  settings: {
    allowPosts?: boolean;
    allowComments?: boolean;
    allowInvites?: boolean;
    requireApproval?: boolean;
    postReviewRequired?: boolean;
  };

  @Column({ type: 'simple-json', nullable: true })
  rules: string[];

  @Column({ nullable: true })
  category: string;

  @ManyToMany(() => Note)
  @JoinTable({
    name: 'community_notes',
    joinColumn: { name: 'community_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'note_id', referencedColumnName: 'id' },
  })
  pinnedNotes: Note[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
