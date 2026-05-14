import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeRecord } from '../entities/practice-record.entity';
import { ErrorCharacter } from '../entities/error-character.entity';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PracticeRecord, ErrorCharacter])],
  providers: [PracticeService],
  controllers: [PracticeController],
  exports: [PracticeService],
})
export class PracticeModule {}
