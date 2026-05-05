import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { InsurancePolicyService } from '../services/insurance-policy.service';
import { InsurancePolicy } from '../interfaces/insurance.interface';

@Controller('insurance-policies')
export class InsurancePolicyController {
  constructor(private readonly insurancePolicyService: InsurancePolicyService) {}

  @Get()
  findAll(@Query('policyNumber') policyNumber?: string): InsurancePolicy[] {
    if (policyNumber) {
      const policy = this.insurancePolicyService.findByPolicyNumber(policyNumber);
      return policy ? [policy] : [];
    }
    return this.insurancePolicyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): InsurancePolicy {
    const policy = this.insurancePolicyService.findOne(id);
    if (!policy) {
      throw new HttpException('Insurance policy not found', HttpStatus.NOT_FOUND);
    }
    return policy;
  }

  @Post()
  create(@Body() policy: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>): InsurancePolicy {
    return this.insurancePolicyService.create(policy);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() policy: Partial<InsurancePolicy>): InsurancePolicy {
    const updatedPolicy = this.insurancePolicyService.update(id, policy);
    if (!updatedPolicy) {
      throw new HttpException('Insurance policy not found', HttpStatus.NOT_FOUND);
    }
    return updatedPolicy;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.insurancePolicyService.remove(id);
    if (!success) {
      throw new HttpException('Insurance policy not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }
}
