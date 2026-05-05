import { Controller, Get, Post, Body, Put, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { Task, TaskStatus } from './interfaces/task.interface';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(): Task[] {
    return this.tasksService.findAll();
  }

  @Get('status/:status')
  getTasksByStatus(@Param('status') status: TaskStatus): Task[] {
    return this.tasksService.getTasksByStatus(status);
  }

  @Get('robot/:robotId')
  getTasksByRobot(@Param('robotId') robotId: string): Task[] {
    return this.tasksService.getTasksByRobot(robotId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Task {
    return this.tasksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Task {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    return this.tasksService.remove(id);
  }

  @Post(':id/assign')
  async assignTask(@Param('id') id: string): Promise<Task> {
    return this.tasksService.assignTask(id);
  }

  @Post(':id/start')
  startTask(@Param('id') id: string): Task {
    return this.tasksService.startTask(id);
  }

  @Post(':id/complete')
  completeTask(@Param('id') id: string): Task {
    return this.tasksService.completeTask(id);
  }

  @Post(':id/cancel')
  cancelTask(@Param('id') id: string): Task {
    return this.tasksService.cancelTask(id);
  }
}
