import { Position, RobotStatus } from '../interfaces/robot.interface';
export declare class CreateRobotDto {
    name: string;
    status?: RobotStatus;
    position?: Position;
    batteryLevel?: number;
    speed?: number;
}
export declare class UpdateRobotDto {
    name?: string;
    status?: RobotStatus;
    position?: Position;
    batteryLevel?: number;
    speed?: number;
    currentTaskId?: string;
    path?: Position[];
    currentPathIndex?: number;
}
