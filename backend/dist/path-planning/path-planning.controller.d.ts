import { PathPlanningService } from './path-planning.service';
import { PlanPathDto } from './dto/plan-path.dto';
import { PathPlanningResult } from './interfaces/path-planning.interface';
export declare class PathPlanningController {
    private readonly pathPlanningService;
    constructor(pathPlanningService: PathPlanningService);
    planPath(planPathDto: PlanPathDto): PathPlanningResult;
    getMapGrid(): import("./interfaces/path-planning.interface").MapGrid;
}
