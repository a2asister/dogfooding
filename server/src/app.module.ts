import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Config } from './entity/Config'
import { ConfigModule } from './config/config.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'dust-effect.db',
      entities: [Config],
      synchronize: true
    }),
    ConfigModule
  ]
})
export class AppModule {}
