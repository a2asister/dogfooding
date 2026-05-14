import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CardController } from './card.controller'
import { CardService } from './card.service'
import { Card } from './card.entity'
import { User } from '../user/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Card, User])],
  controllers: [CardController],
  providers: [CardService]
})
export class CardModule {}
