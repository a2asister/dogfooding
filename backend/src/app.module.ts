import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DesktopModule } from './desktop/desktop.module';
import { FilesModule } from './files/files.module';
import { WindowStateModule } from './window-state/window-state.module';
import { AppDataModule } from './app-data/app-data.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { User } from './entities/user.entity';
import { DesktopConfig } from './entities/desktop-config.entity';
import { FileItem } from './entities/file.entity';
import { WindowState } from './entities/window-state.entity';
import { AppData } from './entities/app-data.entity';
import { FileLock } from './entities/file-lock.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'windows-desktop.db',
      entities: [User, DesktopConfig, FileItem, WindowState, AppData, FileLock, Notification],
      synchronize: true,
    }),
    AuthModule,
    DesktopModule,
    FilesModule,
    WindowStateModule,
    AppDataModule,
    NotificationsModule,
    SearchModule,
  ],
})
export class AppModule {}