import { Injectable, NotFoundException } from '@nestjs/common';
import { Robot } from './interfaces/robot.interface';
import { CreateRobotDto, UpdateRobotDto } from './dto/create-robot.dto';
import { DataStorageService } from '../data-storage/data-storage.service';

@Injectable()
export class RobotsService {
  constructor(private dataStorageService: DataStorageService) {}

  findAll(): Robot[] {
    return this.dataStorageService.getRobots();
  }

  findOne(id: string): Robot {
    const robot = this.dataStorageService.getRobotById(id);
    if (!robot) {
      throw new NotFoundException(`Robot with ID ${id} not found`);
    }
    return robot;
  }

  create(createRobotDto: CreateRobotDto): Robot {
    return this.dataStorageService.createRobot({
      name: createRobotDto.name,
      status: createRobotDto.status || 'idle',
      position: createRobotDto.position || { x: 0, y: 0 },
      batteryLevel: createRobotDto.batteryLevel || 100,
      speed: createRobotDto.speed || 1.0,
    });
  }

  update(id: string, updateRobotDto: UpdateRobotDto): Robot {
    const robot = this.dataStorageService.updateRobot(id, updateRobotDto);
    if (!robot) {
      throw new NotFoundException(`Robot with ID ${id} not found`);
    }
    return robot;
  }

  remove(id: string): void {
    const success = this.dataStorageService.deleteRobot(id);
    if (!success) {
      throw new NotFoundException(`Robot with ID ${id} not found`);
    }
  }

  getAvailableRobots(): Robot[] {
    return this.dataStorageService.getRobots().filter(
      robot => robot.status === 'idle' && robot.batteryLevel > 20,
    );
  }

  updateRobotPath(robotId: string, path: { x: number; y: number }[]): Robot {
    const robot = this.dataStorageService.updateRobot(robotId, {
      path,
      currentPathIndex: 0,
    });
    if (!robot) {
      throw new NotFoundException(`Robot with ID ${robotId} not found`);
    }
    return robot;
  }

  moveRobot(robotId: string): Robot {
    const robot = this.findOne(robotId);
    
    if (!robot.path || robot.path.length === 0) {
      return robot;
    }

    if (robot.currentPathIndex === undefined || robot.currentPathIndex >= robot.path.length) {
      return this.dataStorageService.updateRobot(robotId, {
        status: 'idle',
        path: undefined,
        currentPathIndex: undefined,
      });
    }

    const nextPosition = robot.path[robot.currentPathIndex];
    const batteryDrain = 0.5;

    return this.dataStorageService.updateRobot(robotId, {
      position: nextPosition,
      currentPathIndex: robot.currentPathIndex + 1,
      batteryLevel: Math.max(0, robot.batteryLevel - batteryDrain),
      status: 'moving',
    });
  }
}
