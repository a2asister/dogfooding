import { Position } from '../../robots/interfaces/robot.interface';
import { TaskPriority, TaskStatus } from '../interfaces/task.interface';
export declare class CreateTaskDto {
    name: string;
    description?: string;
    priority?: TaskPriority;
    startPosition: Position;
    targetPosition: Position;
    estimatedTime?: number;
}
export declare class UpdateTaskDto {
    name?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedRobotId?: string;
    actualTime?: number;
}
