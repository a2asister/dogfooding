import { Robot } from './interfaces/robot.interface';
import { CreateRobotDto, UpdateRobotDto } from './dto/create-robot.dto';
import { DataStorageService } from '../data-storage/data-storage.service';
export declare class RobotsService {
    private dataStorageService;
    constructor(dataStorageService: DataStorageService);
    findAll(): Robot[];
    findOne(id: string): Robot;
    create(createRobotDto: CreateRobotDto): Robot;
    update(id: string, updateRobotDto: UpdateRobotDto): Robot;
    remove(id: string): void;
    getAvailableRobots(): Robot[];
    updateRobotPath(robotId: string, path: {
        x: number;
        y: number;
    }[]): Robot;
    moveRobot(robotId: string): Robot;
}
