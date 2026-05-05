import { Position } from '../../robots/interfaces/robot.interface';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export interface Task {
    id: string;
    name: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    startPosition: Position;
    targetPosition: Position;
    assignedRobotId?: string;
    estimatedTime?: number;
    actualTime?: number;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}
