import { RobotsService } from './robots.service';
import { CreateRobotDto, UpdateRobotDto } from './dto/create-robot.dto';
import { Robot } from './interfaces/robot.interface';
export declare class RobotsController {
    private readonly robotsService;
    constructor(robotsService: RobotsService);
    findAll(): Robot[];
    getAvailableRobots(): Robot[];
    findOne(id: string): Robot;
    create(createRobotDto: CreateRobotDto): Robot;
    update(id: string, updateRobotDto: UpdateRobotDto): Robot;
    remove(id: string): void;
    moveRobot(id: string): Robot;
}
