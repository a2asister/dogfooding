export interface Opportunity {
  id: string;
  customerId: string;
  name: string;
  stage: string;
  amount: number;
  probability: number;
  expectedCloseDate: string;
  source: string;
  description: string;
  salesPerson: string;
  createdAt: string;
  updatedAt?: string;
}
