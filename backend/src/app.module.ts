import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DesktopModule } from './desktop/desktop.module';
import { FilesModule } from './files/files.module';
import { User } from './entities/user.entity';
import { DesktopConfig } from './entities/desktop-config.entity';
import { FileItem } from './entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'windows-desktop.db',
      entities: [User, DesktopConfig, FileItem],
      synchronize: true,
    }),
    AuthModule,
    DesktopModule,
    FilesModule,
  ],
})
export class AppModule {}