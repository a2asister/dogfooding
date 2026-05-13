import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subtitle } from './subtitle.entity';
import { SubtitleService } from './subtitle.service';
import { SubtitleResolver } from './subtitle.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Subtitle])],
  providers: [SubtitleService, SubtitleResolver],
  exports: [SubtitleService],
})
export class SubtitleModule {}
