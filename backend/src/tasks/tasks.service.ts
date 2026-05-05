import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Task, TaskPriority, TaskStatus } from './interfaces/task.interface';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { DataStorageService } from '../data-storage/data-storage.service';
import { RobotsService } from '../robots/robots.service';
import { Position } from '../robots/interfaces/robot.interface';

@Injectable()
export class TasksService {
  constructor(
    private dataStorageService: DataStorageService,
    private robotsService: RobotsService,
  ) {}

  findAll(): Task[] {
    return this.dataStorageService.getTasks();
  }

  findOne(id: string): Task {
    const task = this.dataStorageService.getTaskById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  create(createTaskDto: CreateTaskDto): Task {
    return this.dataStorageService.createTask({
      name: createTaskDto.name,
      description: createTaskDto.description || '',
      priority: createTaskDto.priority || 'medium',
      status: 'pending',
      startPosition: createTaskDto.startPosition,
      targetPosition: createTaskDto.targetPosition,
      estimatedTime: createTaskDto.estimatedTime,
    });
  }

  update(id: string, updateTaskDto: UpdateTaskDto): Task {
    const task = this.dataStorageService.updateTask(id, updateTaskDto);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  remove(id: string): void {
    const success = this.dataStorageService.deleteTask(id);
    if (!success) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async assignTask(taskId: string): Promise<Task> {
    const task = this.findOne(taskId);
    
    if (task.status !== 'pending') {
      throw new BadRequestException('Task is not in pending status');
    }

    const availableRobots = this.robotsService.getAvailableRobots();
    
    if (availableRobots.length === 0) {
      throw new BadRequestException('No available robots');
    }

    const bestRobot = this.findBestRobotForTask(availableRobots, task);

    this.robotsService.update(bestRobot.id, {
      status: 'working',
      currentTaskId: task.id,
    });

    return this.dataStorageService.updateTask(taskId, {
      status: 'assigned',
      assignedRobotId: bestRobot.id,
    });
  }

  private findBestRobotForTask(robots: any[], task: Task): any {
    let bestRobot = robots[0];
    let bestScore = this.calculateRobotScore(bestRobot, task);

    for (const robot of robots.slice(1)) {
      const score = this.calculateRobotScore(robot, task);
      if (score > bestScore) {
        bestScore = score;
        bestRobot = robot;
      }
    }

    return bestRobot;
  }

  private calculateRobotScore(robot: any, task: Task): number {
    const distanceToStart = this.calculateDistance(robot.position, task.startPosition);
    const batteryScore = robot.batteryLevel / 100;
    const speedScore = robot.speed;
    
    return (100 - distanceToStart) * 0.5 + batteryScore * 30 + speedScore * 20;
  }

  private calculateDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2),
    );
  }

  startTask(taskId: string): Task {
    const task = this.findOne(taskId);
    
    if (task.status !== 'assigned') {
      throw new BadRequestException('Task is not assigned');
    }

    return this.dataStorageService.updateTask(taskId, {
      status: 'in_progress',
    });
  }

  completeTask(taskId: string): Task {
    const task = this.findOne(taskId);
    
    if (task.status !== 'in_progress') {
      throw new BadRequestException('Task is not in progress');
    }

    if (task.assignedRobotId) {
      this.robotsService.update(task.assignedRobotId, {
        status: 'idle',
        currentTaskId: undefined,
      });
    }

    return this.dataStorageService.updateTask(taskId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  }

  cancelTask(taskId: string): Task {
    const task = this.findOne(taskId);
    
    if (task.assignedRobotId) {
      this.robotsService.update(task.assignedRobotId, {
        status: 'idle',
        currentTaskId: undefined,
      });
    }

    return this.dataStorageService.updateTask(taskId, {
      status: 'cancelled',
      assignedRobotId: undefined,
    });
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.dataStorageService.getTasks().filter(task => task.status === status);
  }

  getTasksByRobot(robotId: string): Task[] {
    return this.dataStorageService.getTasks().filter(task => task.assignedRobotId === robotId);
  }
}
