import { Position } from '../robots/interfaces/robot.interface';
import { Obstacle, ObstacleDetectionResult } from './interfaces/obstacle.interface';
import { DataStorageService } from '../data-storage/data-storage.service';
import { PathPlanningService } from '../path-planning/path-planning.service';
export declare class ObstacleAvoidanceService {
    private dataStorageService;
    private pathPlanningService;
    constructor(dataStorageService: DataStorageService, pathPlanningService: PathPlanningService);
    findAll(): Obstacle[];
    addObstacle(obstacle: Omit<Obstacle, 'id'>): Obstacle;
    removeObstacle(id: string): boolean;
    checkPathForObstacles(start: Position, end: Position, safetyMargin?: number): ObstacleDetectionResult;
    private findAlternativePath;
    private getDistance;
    isPositionSafe(position: Position, safetyMargin?: number): boolean;
    getDynamicObstacles(): Obstacle[];
    updateDynamicObstacles(): void;
}
