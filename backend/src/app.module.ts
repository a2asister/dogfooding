import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from './course/course.module';
import { CheckinModule } from './checkin/checkin.module';
import { FavoriteModule } from './favorite/favorite.module';
import { StatsModule } from './stats/stats.module';
import { CourseEntity } from './entities/course.entity';
import { CheckinEntity } from './entities/checkin.entity';
import { FavoriteEntity } from './entities/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'fitness.db',
      entities: [CourseEntity, CheckinEntity, FavoriteEntity],
      synchronize: true,
    }),
    CourseModule,
    CheckinModule,
    FavoriteModule,
    StatsModule,
  ],
})
export class AppModule {}
