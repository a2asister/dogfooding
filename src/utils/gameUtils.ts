import { v4 as uuidv4 } from 'uuid';
import type { Plot, Player, GameState, CropType, CropInstance, Friend, DailyTask } from '../types';
import {
  CROPS,
  INITIAL_ITEMS,
  INITIAL_PLOTS_COUNT,
  getExperienceToNextLevel,
  DAILY_TASKS,
} from '../config/gameConfig';

export const generateId = (): string => {
  return uuidv4();
};

export const createInitialPlot = (index: number): Plot => {
  return {
    id: generateId(),
    index,
    status: 'empty',
    crop: null,
    hasWeed: false,
    hasPest: false,
    isWatered: true,
  };
};

export const createInitialPlots = (count: number = INITIAL_PLOTS_COUNT): Plot[] => {
  return Array.from({ length: count }, (_, i) => createInitialPlot(i));
};

export const createInitialPlayer = (): Player => {
  return {
    id: generateId(),
    name: '农场主',
    level: 1,
    experience: 0,
    experienceToNextLevel: getExperienceToNextLevel(1),
    gold: 100,
    unlockedPlots: INITIAL_PLOTS_COUNT,
    items: { ...INITIAL_ITEMS },
    warehouse: [],
    dailySignInStreak: 0,
    lastSignInDate: null,
    dailyStealsRemaining: 10,
    protectionTimeEnd: null,
  };
};

export const createMockFriends = (): Friend[] => {
  const friendAvatars = ['👨‍🌾', '👩‍🌾', '🧑‍🌾', '👴', '👵'];
  const friendNames = ['老王农场', '小李菜园', '张奶奶花园', '小明农场', '花花菜园'];
  const friendLevels = [2, 3, 1, 4, 2];

  return friendNames.map((name, index) => {
    const plots: Plot[] = Array.from({ length: 6 }, (_, i) => {
      const plot: Plot = {
        id: generateId(),
        index: i,
        status: 'empty',
        crop: null,
        hasWeed: false,
        hasPest: false,
        isWatered: true,
      };

      if (i < 2) {
        plot.status = 'ready';
        const cropTypes: CropType[] = ['wheat', 'carrot', 'cabbage'];
        const cropType = cropTypes[i % 3];
        const crop = CROPS[cropType];
        plot.crop = {
          type: cropType,
          plantedAt: Date.now() - crop.growthTime * 1000,
          currentStage: crop.stages,
          totalStages: crop.stages,
          timePerStage: Math.floor((crop.growthTime * 1000) / crop.stages),
          growthSpeedMultiplier: 1,
        };
      } else if (i < 4) {
        plot.status = 'growing';
        const cropTypes: CropType[] = ['wheat', 'carrot', 'cabbage'];
        const cropType = cropTypes[(i + 1) % 3];
        const crop = CROPS[cropType];
        plot.crop = {
          type: cropType,
          plantedAt: Date.now() - (crop.growthTime * 1000) / 2,
          currentStage: 2,
          totalStages: crop.stages,
          timePerStage: Math.floor((crop.growthTime * 1000) / crop.stages),
          growthSpeedMultiplier: 1,
        };
      }

      return plot;
    });

    return {
      id: generateId(),
      name,
      level: friendLevels[index],
      avatar: friendAvatars[index],
      plots,
      isProtected: index === 3,
    };
  });
};

export const createInitialDailyTasks = (): DailyTask[] => {
  return DAILY_TASKS.map(task => ({
    ...task,
    current: 0,
    completed: false,
    claimed: false,
  }));
};

export const createInitialGameState = (): GameState => {
  return {
    player: createInitialPlayer(),
    plots: createInitialPlots(),
    friends: createMockFriends(),
    dailyTasks: createInitialDailyTasks(),
    lastUpdate: Date.now(),
  };
};

export const createCropInstance = (cropType: CropType): CropInstance => {
  const crop = CROPS[cropType];
  return {
    type: cropType,
    plantedAt: Date.now(),
    currentStage: 0,
    totalStages: crop.stages,
    timePerStage: Math.floor((crop.growthTime * 1000) / crop.stages),
    growthSpeedMultiplier: 1,
  };
};

export const getCropGrowthProgress = (crop: CropInstance): {
  currentStage: number;
  progress: number;
  isReady: boolean;
  timeRemaining: number;
} => {
  const now = Date.now();
  const elapsed = now - crop.plantedAt;
  const effectiveTimePerStage = crop.timePerStage / crop.growthSpeedMultiplier;
  const totalGrowthTime = effectiveTimePerStage * crop.totalStages;
  
  if (elapsed >= totalGrowthTime) {
    return {
      currentStage: crop.totalStages,
      progress: 100,
      isReady: true,
      timeRemaining: 0,
    };
  }
  
  const currentStage = Math.min(
    Math.floor(elapsed / effectiveTimePerStage),
    crop.totalStages - 1
  );
  const progress = Math.min((elapsed / totalGrowthTime) * 100, 100);
  const timeRemaining = Math.max(totalGrowthTime - elapsed, 0);
  
  return {
    currentStage,
    progress,
    isReady: false,
    timeRemaining: Math.floor(timeRemaining),
  };
};

export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return '已成熟';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟`;
  } else {
    return `${seconds}秒`;
  }
};

export const addExperience = (
  player: Player,
  experience: number
): { player: Player; leveledUp: boolean; newLevel: number } => {
  let newExperience = player.experience + experience;
  let newLevel = player.level;
  let experienceToNextLevel = player.experienceToNextLevel;
  let leveledUp = false;
  
  while (newExperience >= experienceToNextLevel) {
    newExperience -= experienceToNextLevel;
    newLevel += 1;
    experienceToNextLevel = getExperienceToNextLevel(newLevel);
    leveledUp = true;
  }
  
  return {
    player: {
      ...player,
      level: newLevel,
      experience: newExperience,
      experienceToNextLevel,
    },
    leveledUp,
    newLevel,
  };
};
