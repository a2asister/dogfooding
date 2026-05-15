import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from './response.service';
import { ResponseController } from './response.controller';
import { Response } from './response.entity';
import { SurveyModule } from '../survey/survey.module';

@Module({
  imports: [TypeOrmModule.forFeature([Response]), SurveyModule],
  controllers: [ResponseController],
  providers: [ResponseService],
  exports: [ResponseService],
})
export class ResponseModule {}
