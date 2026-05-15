import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Layout } from './entities/layout.entity';
import { TaskService } from './services/task.service';
import { LayoutService } from './services/layout.service';
import { TaskController } from './controllers/task.controller';
import { LayoutController } from './controllers/layout.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'task-kanban.db',
      entities: [Task, Layout],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([Task, Layout]),
  ],
  controllers: [TaskController, LayoutController],
  providers: [TaskService, LayoutService],
})
export class AppModule {}
