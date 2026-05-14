import { Controller, Get, Post, Body } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CheckinEntity } from '../entities/checkin.entity';

@Controller('api/checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get()
  findAll(): Promise<CheckinEntity[]> {
    return this.checkinService.findAll();
  }

  @Post()
  create(@Body() checkinData: Partial<CheckinEntity>): Promise<CheckinEntity> {
    return this.checkinService.create(checkinData);
  }
}
