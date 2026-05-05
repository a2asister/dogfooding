import { Injectable } from '@nestjs/common';
import { Position } from '../robots/interfaces/robot.interface';
import { Obstacle, ObstacleDetectionResult } from './interfaces/obstacle.interface';
import { DataStorageService } from '../data-storage/data-storage.service';
import { PathPlanningService } from '../path-planning/path-planning.service';

@Injectable()
export class ObstacleAvoidanceService {
  constructor(
    private dataStorageService: DataStorageService,
    private pathPlanningService: PathPlanningService,
  ) {}

  findAll(): Obstacle[] {
    return this.dataStorageService.getObstacles();
  }

  addObstacle(obstacle: Omit<Obstacle, 'id'>): Obstacle {
    return this.dataStorageService.addObstacle(obstacle);
  }

  removeObstacle(id: string): boolean {
    return this.dataStorageService.removeObstacle(id);
  }

  checkPathForObstacles(
    start: Position,
    end: Position,
    safetyMargin: number = 1,
  ): ObstacleDetectionResult {
    const obstacles = this.dataStorageService.getObstacles();
    const path = this.pathPlanningService.planPath(start, end);

    const detectedObstacles: Obstacle[] = [];
    let isSafe = true;

    if (path.found && path.path.length > 0) {
      for (const pathPoint of path.path) {
        for (const obstacle of obstacles) {
          const distance = this.getDistance(
            pathPoint,
            obstacle.position,
          );
          
          if (distance <= safetyMargin) {
            if (!detectedObstacles.find(o => o.id === obstacle.id)) {
              detectedObstacles.push(obstacle);
              isSafe = false;
            }
          }
        }
      }
    }

    const safePath = isSafe
      ? path.path
      : this.findAlternativePath(start, end, obstacles, safetyMargin);

    return {
      obstacles: detectedObstacles,
      safePath,
      isSafe,
    };
  }

  private findAlternativePath(
    start: Position,
    end: Position,
    obstacles: Obstacle[],
    safetyMargin: number,
  ): Position[] {
    const additionalObstacles: Position[] = [];
    
    for (const obstacle of obstacles) {
      for (let dx = -safetyMargin; dx <= safetyMargin; dx++) {
        for (let dy = -safetyMargin; dy <= safetyMargin; dy++) {
          additionalObstacles.push({
            x: obstacle.position.x + dx,
            y: obstacle.position.y + dy,
          });
        }
      }
    }

    const result = this.pathPlanningService.planPath(
      start,
      end,
      additionalObstacles,
    );

    return result.found ? result.path : [];
  }

  private getDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2),
    );
  }

  isPositionSafe(position: Position, safetyMargin: number = 1): boolean {
    const obstacles = this.dataStorageService.getObstacles();
    
    for (const obstacle of obstacles) {
      const distance = this.getDistance(position, obstacle.position);
      if (distance <= safetyMargin) {
        return false;
      }
    }
    
    return true;
  }

  getDynamicObstacles(): Obstacle[] {
    return this.dataStorageService
      .getObstacles()
      .filter(obstacle => obstacle.type === 'dynamic');
  }

  updateDynamicObstacles(): void {
    const obstacles = this.dataStorageService.getObstacles();
    const dynamicObstacles = obstacles.filter(o => o.type === 'dynamic');
    
    for (const obstacle of dynamicObstacles) {
      const dx = Math.random() > 0.5 ? 1 : -1;
      const dy = Math.random() > 0.5 ? 1 : -1;
      
      const newPosition = {
        x: Math.max(0, Math.min(19, obstacle.position.x + dx)),
        y: Math.max(0, Math.min(19, obstacle.position.y + dy)),
      };
      
      this.dataStorageService.removeObstacle(obstacle.id);
      this.dataStorageService.addObstacle({
        position: newPosition,
        type: 'dynamic',
        size: obstacle.size,
      });
    }
  }
}
