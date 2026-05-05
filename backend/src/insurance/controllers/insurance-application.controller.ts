import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { InsuranceApplicationService } from '../services/insurance-application.service';
import { InsuranceApplication } from '../interfaces/insurance.interface';

@Controller('insurance-applications')
export class InsuranceApplicationController {
  constructor(private readonly insuranceApplicationService: InsuranceApplicationService) {}

  @Get()
  findAll(): InsuranceApplication[] {
    return this.insuranceApplicationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): InsuranceApplication {
    const application = this.insuranceApplicationService.findOne(id);
    if (!application) {
      throw new HttpException('Insurance application not found', HttpStatus.NOT_FOUND);
    }
    return application;
  }

  @Post()
  create(@Body() application: Omit<InsuranceApplication, 'id' | 'createdAt' | 'updatedAt'>): InsuranceApplication {
    return this.insuranceApplicationService.create(application);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() application: Partial<InsuranceApplication>): InsuranceApplication {
    const updatedApplication = this.insuranceApplicationService.update(id, application);
    if (!updatedApplication) {
      throw new HttpException('Insurance application not found', HttpStatus.NOT_FOUND);
    }
    return updatedApplication;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.insuranceApplicationService.remove(id);
    if (!success) {
      throw new HttpException('Insurance application not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }
}
