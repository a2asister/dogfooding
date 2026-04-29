import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Note } from '../../notes/entities/note.entity';

export enum SyncAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum SyncStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('sync_records')
export class SyncRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'note_id', nullable: true })
  noteId: number;

  @Column({
    type: 'enum',
    enum: SyncAction,
  })
  action: SyncAction;

  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  syncStatus: SyncStatus;

  @CreateDateColumn({ name: 'sync_timestamp' })
  syncTimestamp: Date;

  @Column({ name: 'device_info', type: 'json', nullable: true })
  deviceInfo: Record<string, any>;

  @ManyToOne(() => User, (user) => user.syncRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Note, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'note_id' })
  note: Note;
}
