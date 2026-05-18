import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Note } from './Note';
import { Like } from './Like';
import { Favorite } from './Favorite';
import { Follow } from './Follow';
import { Comment } from './Comment';
import { CommentLike } from './CommentLike';
import { Notification } from './Notification';
import { Dislike } from './Dislike';
import { Block } from './Block';
import { Collection } from './Collection';
import { Blacklist } from './Blacklist';
import { SearchHistory } from './SearchHistory';
import { TopicFollow } from './TopicFollow';

export enum UserRole {
  VISITOR = 'visitor',
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: '用户' })
  nickname: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bio: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  followerCount: number;

  @Column({ default: 0 })
  followingCount: number;

  @Column({ default: 0 })
  noteCount: number;

  @Column({ nullable: true })
  background: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'simple-json', nullable: true })
  privacySettings: {
    showFollowers: boolean;
    showFollowing: boolean;
    showFavorites: boolean;
    allowComment: boolean;
    allowPrivateMessage: boolean;
  };

  @Column({ type: 'simple-json', nullable: true })
  notificationSettings: {
    like: boolean;
    comment: boolean;
    reply: boolean;
    follow: boolean;
    favorite: boolean;
    system: boolean;
  };

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  website: string;

  @OneToMany(() => Note, (note) => note.author)
  notes: Note[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  followers: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followings: Follow[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user)
  commentLikes: CommentLike[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Dislike, (dislike) => dislike.user)
  dislikes: Dislike[];

  @OneToMany(() => Block, (block) => block.user)
  blocks: Block[];

  @OneToMany(() => Collection, (collection) => collection.user)
  collections: Collection[];

  @OneToMany(() => Blacklist, (blacklist) => blacklist.user)
  blacklists: Blacklist[];

  @OneToMany(() => SearchHistory, (searchHistory) => searchHistory.user)
  searchHistories: SearchHistory[];

  @OneToMany(() => TopicFollow, (topicFollow) => topicFollow.user)
  topicFollows: TopicFollow[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
