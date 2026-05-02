export interface PlanMilestone {
  name: string;
  date: string;
}

export interface PlanPricing {
  oneTime: number;
  annual: number;
  total: number;
}

export interface PlanTimeline {
  startDate: string;
  endDate: string;
  milestones: PlanMilestone[];
}

export interface Plan {
  id: string;
  customerId: string;
  name: string;
  version: string;
  status: string;
  description: string;
  scope: string[];
  pricing: PlanPricing;
  timeline: PlanTimeline;
  responsiblePerson: string;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  updatedAt?: string;
}
