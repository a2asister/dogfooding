import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FilesModule } from './modules/files/files.module';
import { SyncModule } from './modules/sync/sync.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { DatabaseModule } from './modules/database/database.module';
import { ShareModule } from './modules/share/share.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      serveRoot: '/',
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    SyncModule,
    CryptoModule,
    DatabaseModule,
    ShareModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
