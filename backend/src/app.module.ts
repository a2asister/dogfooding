import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CardModule } from './card/card.module'
import { UserModule } from './user/user.module'
import { TemplateModule } from './template/template.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true
    }),
    CardModule,
    UserModule,
    TemplateModule
  ]
})
export class AppModule {}
