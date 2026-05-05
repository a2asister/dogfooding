import { Position } from '../../robots/interfaces/robot.interface';
import { ObstacleType } from '../interfaces/obstacle.interface';
export declare class CreateObstacleDto {
    position: Position;
    type?: ObstacleType;
    size?: number;
}
export declare class CheckObstacleDto {
    start: Position;
    end: Position;
    safetyMargin?: number;
}
