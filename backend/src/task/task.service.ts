import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({ order: { order: 'ASC', createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.taskRepository.find({ where: { status }, order: { order: 'ASC' } });
  }

  async create(createTaskInput: CreateTaskInput): Promise<Task> {
    const task = this.taskRepository.create(createTaskInput);
    return this.taskRepository.save(task);
  }

  async update(id: string, updateTaskInput: UpdateTaskInput): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskInput);
    task.updatedAt = new Date();
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<Task> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    return { ...task, id };
  }
}
