import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';

@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get('statistics')
  getStatistics() {
    return this.taskService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
}
