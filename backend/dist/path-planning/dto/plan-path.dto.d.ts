import { Position } from '../../robots/interfaces/robot.interface';
export declare class PlanPathDto {
    start: Position;
    end: Position;
    obstacles?: Position[];
}
