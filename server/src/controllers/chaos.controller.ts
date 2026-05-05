import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { JsonDatabaseService } from '../services/json-database.service';
import { ChaosMonkeyService } from '../services/chaos-monkey.service';
import { ChaosExperiment, ChaosType } from '../types';

@Controller('chaos')
export class ChaosController {
  constructor(
    private readonly dbService: JsonDatabaseService,
    private readonly chaosService: ChaosMonkeyService,
  ) {}

  @Get('experiments')
  async getAllExperiments() {
    return this.chaosService.getAllExperiments();
  }

  @Get('experiments/:id')
  async getExperiment(@Param('id') id: string) {
    const experiment = await this.chaosService.getExperimentById(id);
    if (!experiment) {
      throw new HttpException('Experiment not found', HttpStatus.NOT_FOUND);
    }
    return experiment;
  }

  @Post('experiments')
  async createExperiment(@Body() body: any) {
    if (!body.name || !body.type) {
      throw new HttpException('Name and type are required', HttpStatus.BAD_REQUEST);
    }

    const validTypes = Object.values(ChaosType);
    if (!validTypes.includes(body.type)) {
      throw new HttpException(`Invalid type. Valid types: ${validTypes.join(', ')}`, HttpStatus.BAD_REQUEST);
    }

    const newExperiment = await this.dbService.createChaosExperiment({
      name: body.name,
      description: body.description || '',
      type: body.type,
      targetEndpoint: body.targetEndpoint || '*',
      targetMethod: body.targetMethod || '*',
      intensity: body.intensity ?? 50,
      duration: body.duration ?? 60000,
      probability: body.probability ?? 0.5,
    });

    return newExperiment;
  }

  @Put('experiments/:id')
  async updateExperiment(
    @Param('id') id: string,
    @Body() body: Partial<ChaosExperiment>,
  ) {
    const updated = await this.dbService.updateChaosExperiment(id, body);
    if (!updated) {
      throw new HttpException('Experiment not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  @Delete('experiments/:id')
  async deleteExperiment(@Param('id') id: string) {
    const experiment = await this.chaosService.getExperimentById(id);
    if (experiment && experiment.status === 'running') {
      await this.chaosService.stopExperiment(id);
    }

    const deleted = await this.dbService.deleteChaosExperiment(id);
    if (!deleted) {
      throw new HttpException('Experiment not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }

  @Post('experiments/:id/start')
  async startExperiment(@Param('id') id: string) {
    const experiment = await this.chaosService.getExperimentById(id);
    if (!experiment) {
      throw new HttpException('Experiment not found', HttpStatus.NOT_FOUND);
    }

    if (experiment.status === 'running') {
      return { success: true, message: 'Experiment is already running', experiment };
    }

    const started = await this.chaosService.startExperiment(id);
    if (!started) {
      throw new HttpException('Failed to start experiment', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { success: true, experiment: started };
  }

  @Post('experiments/:id/stop')
  async stopExperiment(@Param('id') id: string) {
    const stopped = await this.chaosService.stopExperiment(id);
    if (!stopped) {
      throw new HttpException('Experiment not found or not running', HttpStatus.NOT_FOUND);
    }
    return { success: true, experiment: stopped };
  }

  @Post('experiments/:id/pause')
  async pauseExperiment(@Param('id') id: string) {
    const experiment = await this.chaosService.getExperimentById(id);
    if (!experiment) {
      throw new HttpException('Experiment not found', HttpStatus.NOT_FOUND);
    }

    if (experiment.status !== 'running') {
      throw new HttpException('Experiment is not running', HttpStatus.BAD_REQUEST);
    }

    const paused = await this.chaosService.pauseExperiment(id);
    if (!paused) {
      throw new HttpException('Failed to pause experiment', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { success: true, experiment: paused };
  }

  @Post('experiments/:id/resume')
  async resumeExperiment(@Param('id') id: string) {
    const experiment = await this.chaosService.getExperimentById(id);
    if (!experiment) {
      throw new HttpException('Experiment not found', HttpStatus.NOT_FOUND);
    }

    if (experiment.status !== 'paused') {
      throw new HttpException('Experiment is not paused', HttpStatus.BAD_REQUEST);
    }

    const resumed = await this.chaosService.resumeExperiment(id);
    if (!resumed) {
      throw new HttpException('Failed to resume experiment', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { success: true, experiment: resumed };
  }

  @Get('active')
  async getActiveExperiments() {
    return this.chaosService.getActiveExperiments();
  }

  @Get('types')
  getChaosTypes() {
    return Object.values(ChaosType);
  }
}
