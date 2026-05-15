import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  glassmorphism: {
    enabled: boolean;
    blur: number;
    opacity: number;
    saturation: number;
  };
  transparency: number;
}

export interface DisplayConfig {
  scale: number;
  fontFamily: string;
  animationsEnabled: boolean;
  iconSize: 'small' | 'medium' | 'large';
}

export interface DateTimeConfig {
  timeFormat: '12h' | '24h';
  dateFormat: string;
  showSeconds: boolean;
  showDate: boolean;
}

export interface PersonalizationConfig {
  accentColor: string;
  soundEffects: boolean;
  notificationsEnabled: boolean;
}

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

  @Column('json', { nullable: true })
  taskbarConfig?: {
    showTime: boolean;
    position: 'bottom' | 'top';
    showSearch: boolean;
    showNotifications: boolean;
    autoHide: boolean;
  };

  @Column('json', { nullable: true })
  startMenu?: Array<{
    id: string;
    name: string;
    icon: string;
  }>;

  @Column('json', { nullable: true })
  theme?: ThemeConfig;

  @Column('json', { nullable: true })
  display?: DisplayConfig;

  @Column('json', { nullable: true })
  dateTime?: DateTimeConfig;

  @Column('json', { nullable: true })
  personalization?: PersonalizationConfig;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToOne(() => User, (user) => user.desktopConfig)
  @JoinColumn()
  user!: User;
}