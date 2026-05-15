import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { VersionService, PathVersion } from '../services/version.service';
import { PathData } from '../services/path.service';

@Controller('versions')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get(':pathId')
  getByPathId(@Param('pathId') pathId: string): Promise<PathVersion[]> {
    return this.versionService.getByPathId(pathId);
  }

  @Post()
  create(@Body() data: { pathId: string; description: string }): Promise<PathVersion> {
    return this.versionService.create(data);
  }

  @Post(':versionId/restore')
  restore(@Param('versionId') versionId: string): Promise<PathData> {
    return this.versionService.restore(versionId);
  }
}