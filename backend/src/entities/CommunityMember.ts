import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Community } from './Community';
import { User } from './User';

export enum CommunityMemberStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  BANNED = 'banned',
  MUTED = 'muted',
  LEFT = 'left',
}

export enum CommunityRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

@Entity('community_members')
@Index(['communityId', 'userId'], { unique: true })
export class CommunityMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community)
  community: Community;

  @Column()
  communityId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'simple-enum',
    enum: CommunityMemberStatus,
    default: CommunityMemberStatus.ACTIVE,
  })
  status: CommunityMemberStatus;

  @Column({ nullable: true })
  joinedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  roles: string[];

  @Column({ nullable: true })
  invitedBy: string;

  @Column({ type: 'text', nullable: true })
  joinReason: string;

  @CreateDateColumn()
  createdAt: Date;
}
