import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as dayjs from 'dayjs';
import { Task } from '../entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    await this.checkOverdue();
    const tasks = await this.taskRepository.find({
      order: { level: 'ASC', order: 'ASC', createdAt: 'DESC' },
    });
    return this.buildTree(tasks);
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const parent = createTaskDto.parentId 
      ? await this.taskRepository.findOne({ where: { id: createTaskDto.parentId } })
      : null;

    const task = this.taskRepository.create({
      ...createTaskDto,
      level: parent ? parent.level + 1 : 0,
      progress: createTaskDto.progress || 0,
      weight: createTaskDto.weight || 1,
    });

    const savedTask = await this.taskRepository.save(task);
    await this.recalculateParentProgress(savedTask.parentId);
    return savedTask;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    const oldParentId = task.parentId;

    if (updateTaskDto.parentId !== undefined && updateTaskDto.parentId !== oldParentId) {
      const newParent = updateTaskDto.parentId 
        ? await this.taskRepository.findOne({ where: { id: updateTaskDto.parentId } })
        : null;
      task.level = newParent ? newParent.level + 1 : 0;
      await this.updateChildrenLevel(id, task.level);
    }

    Object.assign(task, updateTaskDto);

    if (updateTaskDto.isCompleted === true) {
      task.progress = 100;
    } else if (updateTaskDto.isCompleted === false) {
      const children = await this.taskRepository.find({ where: { parentId: id } });
      if (children.length > 0) {
        const totalWeight = children.reduce((sum, child) => sum + child.weight, 0);
        const weightedProgress = children.reduce(
          (sum, child) => sum + child.progress * child.weight,
          0,
        );
        task.progress = Math.round(weightedProgress / totalWeight);
      } else {
        task.progress = 0;
      }
    }

    const savedTask = await this.taskRepository.save(task);
    
    const now = dayjs().toDate();
    if (!savedTask.isCompleted && savedTask.deadline) {
      const isCurrentlyOverdue = dayjs(savedTask.deadline).isBefore(now, 'day');
      if (isCurrentlyOverdue !== savedTask.isOverdue) {
        savedTask.isOverdue = isCurrentlyOverdue;
        await this.taskRepository.save(savedTask);
      }
    } else if (savedTask.isCompleted && savedTask.isOverdue) {
      savedTask.isOverdue = false;
      await this.taskRepository.save(savedTask);
    }
    
    await this.recalculateParentProgress(savedTask.parentId);
    if (oldParentId !== savedTask.parentId) {
      await this.recalculateParentProgress(oldParentId);
    }
    return savedTask;
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    const parentId = task.parentId;
    await this.taskRepository.delete(id);
    await this.recalculateParentProgress(parentId);
  }

  private async updateChildrenLevel(parentId: number, parentLevel: number): Promise<void> {
    const children = await this.taskRepository.find({ where: { parentId } });
    for (const child of children) {
      child.level = parentLevel + 1;
      await this.taskRepository.save(child);
      await this.updateChildrenLevel(child.id, child.level);
    }
  }

  private async recalculateParentProgress(parentId: number | null): Promise<void> {
    if (!parentId) return;

    const children = await this.taskRepository.find({ where: { parentId } });
    if (children.length === 0) return;

    const totalWeight = children.reduce((sum, child) => sum + child.weight, 0);
    const weightedProgress = children.reduce(
      (sum, child) => sum + child.progress * child.weight,
      0,
    );

    const parent = await this.taskRepository.findOne({ where: { id: parentId } });
    if (parent) {
      parent.progress = Math.round(weightedProgress / totalWeight);
      parent.isCompleted = parent.progress >= 100;
      await this.taskRepository.save(parent);
      await this.recalculateParentProgress(parent.parentId);
    }
  }

  private async checkOverdue(): Promise<void> {
    const now = dayjs().toDate();
    const tasks = await this.taskRepository.find();

    for (const task of tasks) {
      if (task.isCompleted) {
        if (task.isOverdue) {
          task.isOverdue = false;
          await this.taskRepository.save(task);
        }
        continue;
      }

      const isCurrentlyOverdue = task.deadline && dayjs(task.deadline).isBefore(now, 'day');
      if (isCurrentlyOverdue && !task.isOverdue) {
        task.isOverdue = true;
        await this.taskRepository.save(task);
      } else if (!isCurrentlyOverdue && task.isOverdue) {
        task.isOverdue = false;
        await this.taskRepository.save(task);
      }
    }
  }

  async getStatistics(): Promise<any> {
    await this.checkOverdue();
    const allTasks = await this.taskRepository.find();
    const completed = allTasks.filter(t => t.isCompleted).length;
    const overdue = allTasks.filter(t => t.isOverdue).length;
    const inProgress = allTasks.filter(t => !t.isCompleted && t.progress > 0).length;
    const notStarted = allTasks.filter(t => !t.isCompleted && t.progress === 0).length;

    const totalWeight = allTasks.reduce((sum, t) => sum + t.weight, 0);
    const weightedProgress = allTasks.reduce(
      (sum, t) => sum + t.progress * t.weight,
      0,
    );
    const overallProgress = totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;

    return {
      total: allTasks.length,
      completed,
      overdue,
      inProgress,
      notStarted,
      overallProgress,
    };
  }

  private buildTree(tasks: Task[]): Task[] {
    const map = new Map<number, Task>();
    const roots: Task[] = [];

    tasks.forEach(task => {
      map.set(task.id, { ...task, children: [] });
    });

    tasks.forEach(task => {
      const node = map.get(task.id);
      if (task.parentId) {
        const parent = map.get(task.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
