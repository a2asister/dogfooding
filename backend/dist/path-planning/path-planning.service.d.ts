import { Position } from '../robots/interfaces/robot.interface';
import { PathPlanningResult } from './interfaces/path-planning.interface';
import { DataStorageService } from '../data-storage/data-storage.service';
export declare class PathPlanningService {
    private dataStorageService;
    constructor(dataStorageService: DataStorageService);
    planPath(start: Position, end: Position, additionalObstacles?: Position[]): PathPlanningResult;
    private getNeighbors;
    private heuristic;
    private getDistance;
    private reconstructPath;
    getMapGrid(): import("./interfaces/path-planning.interface").MapGrid;
}
