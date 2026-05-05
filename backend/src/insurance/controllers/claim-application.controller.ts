import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ClaimApplicationService } from '../services/claim-application.service';
import { ClaimApplication } from '../interfaces/insurance.interface';

@Controller('claim-applications')
export class ClaimApplicationController {
  constructor(private readonly claimApplicationService: ClaimApplicationService) {}

  @Get()
  findAll(@Query('policyId') policyId?: string): ClaimApplication[] {
    if (policyId) {
      return this.claimApplicationService.findByPolicyId(policyId);
    }
    return this.claimApplicationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): ClaimApplication {
    const claim = this.claimApplicationService.findOne(id);
    if (!claim) {
      throw new HttpException('Claim application not found', HttpStatus.NOT_FOUND);
    }
    return claim;
  }

  @Post()
  create(@Body() claim: Omit<ClaimApplication, 'id' | 'createdAt' | 'updatedAt'>): ClaimApplication {
    return this.claimApplicationService.create(claim);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() claim: Partial<ClaimApplication>): ClaimApplication {
    const updatedClaim = this.claimApplicationService.update(id, claim);
    if (!updatedClaim) {
      throw new HttpException('Claim application not found', HttpStatus.NOT_FOUND);
    }
    return updatedClaim;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.claimApplicationService.remove(id);
    if (!success) {
      throw new HttpException('Claim application not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }
}
