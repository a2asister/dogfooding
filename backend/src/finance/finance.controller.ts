import { Controller, Post, Body, Get } from '@nestjs/common';
import { FinanceService, CalculationRequest, CalculationResponse } from './finance.service';

@Controller('api/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('calculate')
  calculate(@Body() request: CalculationRequest): CalculationResponse {
    return this.financeService.calculate(request);
  }

  @Get('plans')
  getPlans() {
    return this.financeService.getPlans();
  }
}
