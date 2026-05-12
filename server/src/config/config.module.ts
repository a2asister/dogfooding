import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './config.entity';
import { ConfigService } from './config.service';
import { ConfigResolver } from './config.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Config])],
  providers: [ConfigService, ConfigResolver],
})
export class ConfigModule {}
