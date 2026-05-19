import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Note } from './Note';
import { User } from './User';

export enum ProtectionType {
  WATERMARK = 'watermark',
  DISABLE_COPY = 'disable_copy',
  ENCRYPTED_CONTENT = 'encrypted_content',
  PAYWALL = 'paywall',
  SUBSCRIPTION_ONLY = 'subscription_only',
}

export enum CopyProtectionLevel {
  NONE = 'none',
  BASIC = 'basic',
  STANDARD = 'standard',
  STRONG = 'strong',
  MAXIMUM = 'maximum',
}

@Entity('content_protections')
@Index(['noteId', 'protectionType'], { unique: true })
export class ContentProtection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Note)
  note: Note;

  @Column()
  noteId: string;

  @ManyToOne(() => User)
  owner: User;

  @Column()
  ownerId: string;

  @Column({
    type: 'simple-enum',
    enum: ProtectionType,
  })
  protectionType: ProtectionType;

  @Column({
    type: 'simple-enum',
    enum: CopyProtectionLevel,
    default: CopyProtectionLevel.STANDARD,
  })
  copyProtectionLevel: CopyProtectionLevel;

  @Column({ default: true })
  disableTextSelection: boolean;

  @Column({ default: true })
  disableRightClick: boolean;

  @Column({ default: true })
  disableKeyboardCopy: boolean;

  @Column({ default: true })
  disablePrint: boolean;

  @Column({ default: false })
  enableWatermark: boolean;

  @Column({ type: 'simple-json', nullable: true })
  watermarkConfig: {
    text: string;
    opacity: number;
    fontSize: number;
    color: string;
    rotation: number;
    spacing: number;
  };

  @Column({ default: false })
  enableScreenshotProtection: boolean;

  @Column({ type: 'simple-json', nullable: true })
  accessRules: {
    allowMembersOnly?: boolean;
    allowFollowersOnly?: boolean;
    requireEmail?: boolean;
    requirePhone?: boolean;
    maxViewsPerUser?: number;
    paywallPrice?: number;
  };

  @Column({ type: 'text', nullable: true })
  encryptedContent: string;

  @Column({ type: 'text', nullable: true })
  encryptionKey: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
