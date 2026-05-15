import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }

  @Post(':id/calculate-responsive')
  async calculateResponsive(
    @Param('id') id: string,
    @Body() body: { deviceType: string },
  ) {
    const project = await this.projectService.findOne(id);
    return this.projectService.calculateResponsiveParams(
      project.pageStructure,
      body.deviceType,
    );
  }

  @Post(':id/calibrate-scroll')
  async calibrateScroll(
    @Param('id') id: string,
    @Body() body: { scrollProgress: number },
  ) {
    const project = await this.projectService.findOne(id);
    return this.projectService.calibrateScroll(
      project.animationConfig,
      body.scrollProgress,
    );
  }
}
