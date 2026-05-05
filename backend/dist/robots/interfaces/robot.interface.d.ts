export interface Position {
    x: number;
    y: number;
}
export type RobotStatus = 'idle' | 'working' | 'charging' | 'error' | 'moving';
export interface Robot {
    id: string;
    name: string;
    status: RobotStatus;
    position: Position;
    batteryLevel: number;
    speed: number;
    lastUpdate: string;
    currentTaskId?: string;
    path?: Position[];
    currentPathIndex?: number;
}
