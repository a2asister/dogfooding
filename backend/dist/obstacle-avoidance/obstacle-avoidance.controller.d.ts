import { ObstacleAvoidanceService } from './obstacle-avoidance.service';
import { CreateObstacleDto, CheckObstacleDto } from './dto/create-obstacle.dto';
import { Obstacle, ObstacleDetectionResult } from './interfaces/obstacle.interface';
export declare class ObstacleAvoidanceController {
    private readonly obstacleAvoidanceService;
    constructor(obstacleAvoidanceService: ObstacleAvoidanceService);
    findAll(): Obstacle[];
    getDynamicObstacles(): Obstacle[];
    addObstacle(createObstacleDto: CreateObstacleDto): Obstacle;
    removeObstacle(id: string): void;
    checkPathForObstacles(checkObstacleDto: CheckObstacleDto): ObstacleDetectionResult;
    updateDynamicObstacles(): void;
}
