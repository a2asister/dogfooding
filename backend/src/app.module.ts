import { Module } from '@nestjs/common';
import { RobotsModule } from './robots/robots.module';
import { TasksModule } from './tasks/tasks.module';
import { PathPlanningModule } from './path-planning/path-planning.module';
import { ObstacleAvoidanceModule } from './obstacle-avoidance/obstacle-avoidance.module';
import { DataStorageModule } from './data-storage/data-storage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    DataStorageModule,
    RobotsModule,
    TasksModule,
    PathPlanningModule,
    ObstacleAvoidanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
