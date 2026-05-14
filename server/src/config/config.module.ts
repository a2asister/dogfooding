import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Config } from '../entity/Config'
import { ConfigService } from './config.service'
import { ConfigController } from './config.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Config])],
  controllers: [ConfigController],
  providers: [ConfigService]
})
export class ConfigModule {}
