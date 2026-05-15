import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AppDataService } from './app-data.service';
import { CreateAppDataDto, UpdateAppDataDto } from './dto/app-data.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('app-data')
@UseGuards(JwtAuthGuard)
export class AppDataController {
  constructor(private readonly appDataService: AppDataService) {}

  @Get()
  async getAllByType(@Request() req: any, @Query('type') type: string) {
    return this.appDataService.getAllByType(req.user.userId, type);
  }

  @Get('latest')
  async getLatestByType(@Request() req: any, @Query('type') type: string) {
    return this.appDataService.getLatestByType(req.user.userId, type);
  }

  @Get(':id')
  async getById(@Request() req: any, @Param('id') id: string) {
    return this.appDataService.getById(req.user.userId, parseInt(id, 10));
  }

  @Post()
  async create(@Request() req: any, @Body() createDto: CreateAppDataDto) {
    return this.appDataService.create(req.user.userId, createDto);
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateAppDataDto,
  ) {
    return this.appDataService.update(req.user.userId, parseInt(id, 10), updateDto);
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.appDataService.delete(req.user.userId, parseInt(id, 10));
  }

  @Delete()
  async deleteAllByType(@Request() req: any, @Query('type') type: string) {
    return this.appDataService.deleteAllByType(req.user.userId, type);
  }
}
