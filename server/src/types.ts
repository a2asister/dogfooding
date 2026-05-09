export interface Plant {
  id: string;
  name: string;
  species: string;
  note?: string;
  avatarUrl?: string;
  careSchedule: CareSchedule;
  latestCareTime?: LatestCareTime;
  createdAt: string;
  updatedAt: string;
}

export interface CareSchedule {
  watering: { days: number; enabled: boolean };
  fertilizing: { days: number; enabled: boolean };
  pruning: { days: number; enabled: boolean };
}

export interface LatestCareTime {
  watering?: string;
  fertilizing?: string;
  pruning?: string;
}

export type CareType = 'watering' | 'fertilizing' | 'pruning' | 'photo';

export interface CareRecord {
  id: string;
  plantId: string;
  type: CareType;
  note?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface MonthlyStats {
  month: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  byType: Record<CareType, number>;
  records: CareRecord[];
}