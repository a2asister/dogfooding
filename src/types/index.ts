export type CropType = 'wheat' | 'carrot' | 'cabbage';

export type PlotStatus = 'empty' | 'plowed' | 'planted' | 'growing' | 'ready' | 'withered';

export type ItemType = 'fertilizer' | 'herbicide' | 'pesticide' | 'speedCard' | 'protectionCard' | 'reclamationCard';

export interface Crop {
  id: string;
  type: CropType;
  name: string;
  growthTime: number;
  purchasePrice: number;
  sellPrice: number;
  experience: number;
  stages: number;
  emoji: string;
}

export interface Plot {
  id: string;
  index: number;
  status: PlotStatus;
  crop: CropInstance | null;
  hasWeed: boolean;
  hasPest: boolean;
  isWatered: boolean;
}

export interface CropInstance {
  type: CropType;
  plantedAt: number;
  currentStage: number;
  totalStages: number;
  timePerStage: number;
  growthSpeedMultiplier: number;
}

export interface PlayerItems {
  fertilizer: number;
  herbicide: number;
  pesticide: number;
  speedCard: number;
  protectionCard: number;
  reclamationCard: number;
}

export interface WarehouseItem {
  cropType: CropType;
  quantity: number;
}

export interface Player {
  id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  gold: number;
  unlockedPlots: number;
  items: PlayerItems;
  warehouse: WarehouseItem[];
  dailySignInStreak: number;
  lastSignInDate: string | null;
  dailyStealsRemaining: number;
  protectionTimeEnd: number | null;
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  avatar: string;
  plots: Plot[];
  isProtected: boolean;
}

export interface DailyTask {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  reward: {
    gold?: number;
    experience?: number;
    items?: Partial<PlayerItems>;
  };
  completed: boolean;
  claimed: boolean;
}

export interface GameState {
  player: Player;
  plots: Plot[];
  friends: Friend[];
  dailyTasks: DailyTask[];
  lastUpdate: number;
}
