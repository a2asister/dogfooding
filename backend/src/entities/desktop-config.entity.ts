import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class DesktopConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('json')
  layout!: Array<{
    id: string;
    name: string;
    icon: string;
    x: number;
    y: number;
    type: 'folder' | 'file' | 'app';
  }>;

  @Column()
  wallpaper!: string;

  @Column('json')
  taskbarConfig!: {
    showTime: boolean;
    position: 'bottom' | 'top';
  };

  @Column('json')
  startMenu!: Array<{
    id: string;
    name: string;
    icon: string;
  }>;

  @OneToOne(() => User, (user) => user.desktopConfig)
  @JoinColumn()
  user!: User;
}