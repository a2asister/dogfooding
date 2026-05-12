import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from './meeting.entity';
import { MeetingService } from './meeting.service';
import { MeetingResolver } from './meeting.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting])],
  providers: [MeetingService, MeetingResolver],
})
export class MeetingModule {}
