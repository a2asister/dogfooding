import type { Crop, ItemType, PlayerItems } from '../types';

export const CROPS: Record<string, Crop> = {
  wheat: {
    id: 'wheat',
    type: 'wheat',
    name: '小麦',
    growthTime: 600,
    purchasePrice: 10,
    sellPrice: 25,
    experience: 15,
    stages: 4,
    emoji: '🌾',
  },
  carrot: {
    id: 'carrot',
    type: 'carrot',
    name: '胡萝卜',
    growthTime: 900,
    purchasePrice: 15,
    sellPrice: 35,
    experience: 20,
    stages: 4,
    emoji: '🥕',
  },
  cabbage: {
    id: 'cabbage',
    type: 'cabbage',
    name: '白菜',
    growthTime: 1200,
    purchasePrice: 20,
    sellPrice: 45,
    experience: 25,
    stages: 4,
    emoji: '🥬',
  },
};

export const ITEM_INFO: Record<ItemType, { name: string; emoji: string; description: string }> = {
  fertilizer: {
    name: '肥料',
    emoji: '💩',
    description: '加速作物生长20%',
  },
  herbicide: {
    name: '除草剂',
    emoji: '🧪',
    description: '清除杂草',
  },
  pesticide: {
    name: '杀虫剂',
    emoji: '💊',
    description: '杀死害虫',
  },
  speedCard: {
    name: '加速卡',
    emoji: '⚡',
    description: '立即成熟',
  },
  protectionCard: {
    name: '保护卡',
    emoji: '🛡️',
    description: '2小时内无法被偷',
  },
  reclamationCard: {
    name: '开垦卡',
    emoji: '🔓',
    description: '解锁新地块',
  },
};

export const INITIAL_ITEMS: PlayerItems = {
  fertilizer: 5,
  herbicide: 3,
  pesticide: 3,
  speedCard: 0,
  protectionCard: 0,
  reclamationCard: 0,
};

export const getExperienceToNextLevel = (level: number): number => {
  return 100 + (level - 1) * 50;
};

export const getMaxStealsPerDay = (level: number): number => {
  return 10 + Math.floor(level / 2);
};

export const getMaxPlots = (level: number): number => {
  return 6 + Math.floor(level / 3);
};

export const INITIAL_PLOTS_COUNT = 6;
export const FERTILIZER_SPEED_BOOST = 0.2;
export const DAILY_STEAL_LIMIT = 10;
export const PROTECTION_DURATION = 2 * 60 * 60 * 1000;
export const MAX_STEAL_PER_CROP = 0.2;
export const STORAGE_KEY = 'farm_game_save';
