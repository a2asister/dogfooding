import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../entities/user.entity';
import { DesktopConfig } from '../entities/desktop-config.entity';
import { FileItem } from '../entities/file.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'windows-desktop-secret-key-2024',
      signOptions: { expiresIn: '7d' },
    }),
    TypeOrmModule.forFeature([User, DesktopConfig, FileItem]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}