import { Injectable } from '@nestjs/common';

export interface CalculationRequest {
  principal: number;
  rate: number;
  years: number;
  planType: string;
}

export interface YearlyData {
  year: number;
  amount: number;
  interest: number;
}

export interface CalculationResponse {
  finalAmount: number;
  totalInterest: number;
  yearlyData: YearlyData[];
  planType: string;
}

@Injectable()
export class FinanceService {
  private plans = {
    conservative: { rate: 2.5, name: '保守型' },
    balanced: { rate: 5.0, name: '平衡型' },
    aggressive: { rate: 8.5, name: '进取型' },
  };

  calculate(request: CalculationRequest): CalculationResponse {
    const { principal, years, planType } = request;
    const plan = this.plans[planType as keyof typeof this.plans];
    const rate = plan ? plan.rate : request.rate;

    const yearlyData: YearlyData[] = [];
    let currentAmount = principal;

    for (let year = 1; year <= years; year++) {
      const interest = currentAmount * (rate / 100);
      currentAmount += interest;
      yearlyData.push({
        year,
        amount: Math.round(currentAmount * 100) / 100,
        interest: Math.round(interest * 100) / 100,
      });
    }

    return {
      finalAmount: Math.round(currentAmount * 100) / 100,
      totalInterest: Math.round((currentAmount - principal) * 100) / 100,
      yearlyData,
      planType,
    };
  }

  getPlans() {
    return this.plans;
  }
}
