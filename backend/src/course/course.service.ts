import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../entities/course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private courseRepository: Repository<CourseEntity>,
  ) {
    this.initializeCourses();
  }

  async findAll(): Promise<CourseEntity[]> {
    return this.courseRepository.find();
  }

  async findOne(id: number): Promise<CourseEntity | null> {
    return this.courseRepository.findOneBy({ id });
  }

  private async initializeCourses(): Promise<void> {
    const count = await this.courseRepository.count();
    if (count === 0) {
      const defaultCourses: Partial<CourseEntity>[] = [
        { name: '深蹲入门', description: '基础深蹲动作训练', duration: 15, calories: 100, difficulty: '简单', thumbnail: '🏋️' },
        { name: '俯卧撑训练', description: '上肢力量核心训练', duration: 20, calories: 150, difficulty: '中等', thumbnail: '💪' },
        { name: '平板支撑', description: '核心肌群稳定性训练', duration: 10, calories: 80, difficulty: '简单', thumbnail: '🧘' },
        { name: '跳跃训练', description: '爆发力有氧训练', duration: 25, calories: 200, difficulty: '困难', thumbnail: '🦘' },
      ];
      await this.courseRepository.save(defaultCourses);
    }
  }
}
