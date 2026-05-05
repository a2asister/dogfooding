import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { Task, TaskStatus } from './interfaces/task.interface';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(): Task[];
    getTasksByStatus(status: TaskStatus): Task[];
    getTasksByRobot(robotId: string): Task[];
    findOne(id: string): Task;
    create(createTaskDto: CreateTaskDto): Task;
    update(id: string, updateTaskDto: UpdateTaskDto): Task;
    remove(id: string): void;
    assignTask(id: string): Promise<Task>;
    startTask(id: string): Task;
    completeTask(id: string): Task;
    cancelTask(id: string): Task;
}
