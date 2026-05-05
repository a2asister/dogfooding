import { Task, TaskStatus } from './interfaces/task.interface';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { DataStorageService } from '../data-storage/data-storage.service';
import { RobotsService } from '../robots/robots.service';
export declare class TasksService {
    private dataStorageService;
    private robotsService;
    constructor(dataStorageService: DataStorageService, robotsService: RobotsService);
    findAll(): Task[];
    findOne(id: string): Task;
    create(createTaskDto: CreateTaskDto): Task;
    update(id: string, updateTaskDto: UpdateTaskDto): Task;
    remove(id: string): void;
    assignTask(taskId: string): Promise<Task>;
    private findBestRobotForTask;
    private calculateRobotScore;
    private calculateDistance;
    startTask(taskId: string): Task;
    completeTask(taskId: string): Task;
    cancelTask(taskId: string): Task;
    getTasksByStatus(status: TaskStatus): Task[];
    getTasksByRobot(robotId: string): Task[];
}
