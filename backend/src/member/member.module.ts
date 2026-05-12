import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Member } from './member.entity'
import { MemberService } from './member.service'
import { MemberResolver } from './member.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  providers: [MemberService, MemberResolver],
})
export class MemberModule {}
