import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { CourseEntity } from '../entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity])],
  providers: [CourseService],
  controllers: [CourseController],
})
export class CourseModule {}
