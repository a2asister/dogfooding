import { Controller, Get, Post, Body, Put, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { RobotsService } from './robots.service';
import { CreateRobotDto, UpdateRobotDto } from './dto/create-robot.dto';
import { Robot } from './interfaces/robot.interface';

@Controller('api/robots')
export class RobotsController {
  constructor(private readonly robotsService: RobotsService) {}

  @Get()
  findAll(): Robot[] {
    return this.robotsService.findAll();
  }

  @Get('available')
  getAvailableRobots(): Robot[] {
    return this.robotsService.getAvailableRobots();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Robot {
    return this.robotsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRobotDto: CreateRobotDto): Robot {
    return this.robotsService.create(createRobotDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRobotDto: UpdateRobotDto): Robot {
    return this.robotsService.update(id, updateRobotDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.robotsService.remove(id);
  }

  @Put(':id/move')
  moveRobot(@Param('id') id: string): Robot {
    return this.robotsService.moveRobot(id);
  }
}
