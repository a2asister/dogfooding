import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { GameState, CropType, ItemType, WarehouseItem, DailyTask, Friend } from '../types';
import { createInitialGameState, createCropInstance, addExperience, getCropGrowthProgress, generateId } from '../utils/gameUtils';
import { CROPS, FERTILIZER_SPEED_BOOST, STORAGE_KEY, ITEM_INFO, MAX_STEAL_PER_CROP } from '../config/gameConfig';

type GameAction =
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'RESET_STATE' }
  | { type: 'UPDATE_CROP_GROWTH' }
  | { type: 'PLOW_PLOT'; payload: { plotId: string } }
  | { type: 'PLANT_CROP'; payload: { plotId: string; cropType: CropType } }
  | { type: 'HARVEST_CROP'; payload: { plotId: string } }
  | { type: 'USE_ITEM'; payload: { plotId: string; itemType: ItemType } }
  | { type: 'ADD_WAREHOUSE_ITEM'; payload: { cropType: CropType; quantity: number } }
  | { type: 'REMOVE_WAREHOUSE_ITEM'; payload: { cropType: CropType; quantity: number } }
  | { type: 'SELL_CROP'; payload: { cropType: CropType; quantity: number } }
  | { type: 'ADD_EXPERIENCE'; payload: { experience: number } }
  | { type: 'ADD_GOLD'; payload: { amount: number } }
  | { type: 'ADD_ITEM'; payload: { itemType: ItemType; quantity: number } }
  | { type: 'BUY_ITEM'; payload: { itemType: ItemType; price: number } }
  | { type: 'BUY_SEED'; payload: { cropType: CropType; price: number } }
  | { type: 'UPDATE_TASK_PROGRESS'; payload: { taskId: string; progress: number } }
  | { type: 'CLAIM_TASK_REWARD'; payload: { taskId: string } }
  | { type: 'STEAL_FROM_FRIEND'; payload: { friendId: string; plotId: string } }
  | { type: 'USE_PROTECTION_CARD' }
  | { type: 'DAILY_RESET' }
  | { type: 'SET_FRIENDS'; payload: Friend[] };

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  plowPlot: (plotId: string) => void;
  plantCrop: (plotId: string, cropType: CropType) => void;
  harvestCrop: (plotId: string) => void;
  useItem: (plotId: string, itemType: ItemType) => void;
  sellCrop: (cropType: CropType, quantity: number) => void;
  addGold: (amount: number) => void;
  addExperience: (experience: number) => void;
  buyItem: (itemType: ItemType, price: number) => void;
  buySeed: (cropType: CropType, price: number) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  claimTaskReward: (taskId: string) => void;
  stealFromFriend: (friendId: string, plotId: string) => void;
  useProtectionCard: () => void;
  setFriends: (friends: Friend[]) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const updateTaskProgressInternal = (
  tasks: DailyTask[],
  taskId: string,
  progress: number
): DailyTask[] => {
  return tasks.map(task => {
    if (task.id === taskId && !task.completed) {
      const newCurrent = Math.min(task.current + progress, task.target);
      return {
        ...task,
        current: newCurrent,
        completed: newCurrent >= task.target,
      };
    }
    return task;
  });
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
    
    case 'RESET_STATE':
      return createInitialGameState();
    
    case 'UPDATE_CROP_GROWTH': {
      const updatedPlots = state.plots.map(plot => {
        if (plot.crop && plot.status !== 'ready' && plot.status !== 'withered') {
          const progress = getCropGrowthProgress(plot.crop);
          if (progress.isReady) {
            return {
              ...plot,
              status: 'ready' as const,
              crop: {
                ...plot.crop,
                currentStage: plot.crop.totalStages,
              },
            };
          }
          return {
            ...plot,
            status: 'growing' as const,
            crop: {
              ...plot.crop,
              currentStage: progress.currentStage,
            },
          };
        }
        return plot;
      });
      return { ...state, plots: updatedPlots, lastUpdate: Date.now() };
    }
    
    case 'PLOW_PLOT': {
      const updatedPlots = state.plots.map(plot => {
        if (plot.id === action.payload.plotId && plot.status === 'empty') {
          return { ...plot, status: 'plowed' as const };
        }
        return plot;
      });
      return { ...state, plots: updatedPlots };
    }
    
    case 'PLANT_CROP': {
      const crop = CROPS[action.payload.cropType];
      if (!crop) return state;
      
      const updatedPlots = state.plots.map(plot => {
        if (plot.id === action.payload.plotId && plot.status === 'plowed') {
          return {
            ...plot,
            status: 'growing' as const,
            crop: createCropInstance(action.payload.cropType),
          };
        }
        return plot;
      });
      
      const playerWithExp = addExperience(state.player, 5);
      const updatedTasks = updateTaskProgressInternal(state.dailyTasks, 'plant_3', 1);
      
      return {
        ...state,
        plots: updatedPlots,
        player: playerWithExp.player,
        dailyTasks: updatedTasks,
      };
    }
    
    case 'HARVEST_CROP': {
      const plot = state.plots.find(p => p.id === action.payload.plotId);
      if (!plot || !plot.crop || plot.status !== 'ready') return state;
      
      const crop = CROPS[plot.crop.type];
      if (!crop) return state;
      
      let updatedWarehouse: WarehouseItem[];
      const existingItem = state.player.warehouse.find(
        item => item.cropType === plot.crop!.type
      );
      
      if (existingItem) {
        updatedWarehouse = state.player.warehouse.map(item =>
          item.cropType === plot.crop!.type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedWarehouse = [...state.player.warehouse, { cropType: plot.crop.type, quantity: 1 }];
      }
      
      const updatedPlots = state.plots.map(p => {
        if (p.id === action.payload.plotId) {
          return {
            ...p,
            status: 'empty' as const,
            crop: null,
            hasWeed: false,
            hasPest: false,
          };
        }
        return p;
      });
      
      const playerWithExp = addExperience(
        { ...state.player, warehouse: updatedWarehouse },
        crop.experience
      );
      
      const updatedTasks = updateTaskProgressInternal(state.dailyTasks, 'harvest_2', 1);
      
      return {
        ...state,
        plots: updatedPlots,
        player: playerWithExp.player,
        dailyTasks: updatedTasks,
      };
    }
    
    case 'USE_ITEM': {
      const { plotId, itemType } = action.payload;
      
      if (state.player.items[itemType] <= 0) return state;
      
      const updatedItems = {
        ...state.player.items,
        [itemType]: state.player.items[itemType] - 1,
      };
      
      let updatedPlots = state.plots;
      
      if (itemType === 'fertilizer') {
        updatedPlots = state.plots.map(plot => {
          if (plot.id === plotId && plot.crop) {
            const now = Date.now();
            const elapsed = now - plot.crop.plantedAt;
            const currentMultiplier = plot.crop.growthSpeedMultiplier;
            const newMultiplier = currentMultiplier * (1 + FERTILIZER_SPEED_BOOST);
            
            const effectiveElapsed = elapsed * currentMultiplier;
            const newPlantedAt = now - (effectiveElapsed / newMultiplier);
            
            return {
              ...plot,
              crop: {
                ...plot.crop,
                growthSpeedMultiplier: newMultiplier,
                plantedAt: newPlantedAt,
              },
            };
          }
          return plot;
        });
      } else if (itemType === 'herbicide') {
        updatedPlots = state.plots.map(plot => {
          if (plot.id === plotId) {
            return { ...plot, hasWeed: false };
          }
          return plot;
        });
      } else if (itemType === 'pesticide') {
        updatedPlots = state.plots.map(plot => {
          if (plot.id === plotId) {
            return { ...plot, hasPest: false };
          }
          return plot;
        });
      } else if (itemType === 'speedCard') {
        updatedPlots = state.plots.map(plot => {
          if (plot.id === plotId && plot.crop) {
            return {
              ...plot,
              status: 'ready' as const,
              crop: {
                ...plot.crop,
                currentStage: plot.crop.totalStages,
                plantedAt: Date.now() - (plot.crop.timePerStage * plot.crop.totalStages * 1000),
              },
            };
          }
          return plot;
        });
      }
      
      return {
        ...state,
        plots: updatedPlots,
        player: { ...state.player, items: updatedItems },
      };
    }
    
    case 'SELL_CROP': {
      const { cropType, quantity } = action.payload;
      const crop = CROPS[cropType];
      if (!crop) return state;
      
      const warehouseItem = state.player.warehouse.find(item => item.cropType === cropType);
      if (!warehouseItem || warehouseItem.quantity < quantity) return state;
      
      const goldEarned = crop.sellPrice * quantity;
      
      let updatedWarehouse: WarehouseItem[];
      if (warehouseItem.quantity === quantity) {
        updatedWarehouse = state.player.warehouse.filter(item => item.cropType !== cropType);
      } else {
        updatedWarehouse = state.player.warehouse.map(item =>
          item.cropType === cropType
            ? { ...item, quantity: item.quantity - quantity }
            : item
        );
      }
      
      const updatedTasks = updateTaskProgressInternal(state.dailyTasks, 'sell_100', goldEarned);
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + goldEarned,
          warehouse: updatedWarehouse,
        },
        dailyTasks: updatedTasks,
      };
    }
    
    case 'ADD_EXPERIENCE': {
      const result = addExperience(state.player, action.payload.experience);
      return { ...state, player: result.player };
    }
    
    case 'ADD_GOLD': {
      return {
        ...state,
        player: { ...state.player, gold: state.player.gold + action.payload.amount },
      };
    }
    
    case 'ADD_ITEM': {
      return {
        ...state,
        player: {
          ...state.player,
          items: {
            ...state.player.items,
            [action.payload.itemType]: state.player.items[action.payload.itemType] + action.payload.quantity,
          },
        },
      };
    }
    
    case 'BUY_ITEM': {
      const { itemType, price } = action.payload;
      if (state.player.gold < price) return state;
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - price,
          items: {
            ...state.player.items,
            [itemType]: state.player.items[itemType] + 1,
          },
        },
      };
    }
    
    case 'BUY_SEED': {
      const { cropType, price } = action.payload;
      if (state.player.gold < price) return state;
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - price,
        },
      };
    }
    
    case 'UPDATE_TASK_PROGRESS': {
      const { taskId, progress } = action.payload;
      const updatedTasks = state.dailyTasks.map(task => {
        if (task.id === taskId && !task.completed) {
          const newCurrent = Math.min(task.current + progress, task.target);
          return {
            ...task,
            current: newCurrent,
            completed: newCurrent >= task.target,
          };
        }
        return task;
      });
      return { ...state, dailyTasks: updatedTasks };
    }
    
    case 'CLAIM_TASK_REWARD': {
      const { taskId } = action.payload;
      const task = state.dailyTasks.find(t => t.id === taskId);
      if (!task || !task.completed || task.claimed) return state;
      
      const updatedTasks = state.dailyTasks.map(t =>
        t.id === taskId ? { ...t, claimed: true } : t
      );
      
      let updatedPlayer = { ...state.player };
      
      if (task.reward.gold) {
        updatedPlayer.gold += task.reward.gold;
      }
      if (task.reward.experience) {
        const expResult = addExperience(updatedPlayer, task.reward.experience);
        updatedPlayer = expResult.player;
      }
      if (task.reward.items) {
        Object.entries(task.reward.items).forEach(([itemType, quantity]) => {
          if (quantity) {
            updatedPlayer.items[itemType as ItemType] += quantity;
          }
        });
      }
      
      return { ...state, player: updatedPlayer, dailyTasks: updatedTasks };
    }
    
    case 'STEAL_FROM_FRIEND': {
      const { friendId, plotId } = action.payload;
      
      if (state.player.dailyStealsRemaining <= 0) return state;
      
      const friend = state.friends.find(f => f.id === friendId);
      if (!friend || friend.isProtected) return state;
      
      const plot = friend.plots.find(p => p.id === plotId);
      if (!plot || plot.status !== 'ready' || !plot.crop) return state;
      
      const crop = CROPS[plot.crop.type];
      if (!crop) return state;
      
      const updatedFriends = state.friends.map(f => {
        if (f.id === friendId) {
          return {
            ...f,
            plots: f.plots.map(p => {
              if (p.id === plotId) {
                return {
                  ...p,
                  status: 'empty' as const,
                  crop: null,
                };
              }
              return p;
            }),
          };
        }
        return f;
      });
      
      let updatedWarehouse: WarehouseItem[];
      const existingItem = state.player.warehouse.find(
        item => item.cropType === plot.crop!.type
      );
      
      if (existingItem) {
        updatedWarehouse = state.player.warehouse.map(item =>
          item.cropType === plot.crop!.type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedWarehouse = [...state.player.warehouse, { cropType: plot.crop.type, quantity: 1 }];
      }
      
      const updatedTasks = updateTaskProgressInternal(state.dailyTasks, 'steal_1', 1);
      
      return {
        ...state,
        friends: updatedFriends,
        player: {
          ...state.player,
          dailyStealsRemaining: state.player.dailyStealsRemaining - 1,
          warehouse: updatedWarehouse,
        },
        dailyTasks: updatedTasks,
      };
    }
    
    case 'USE_PROTECTION_CARD': {
      if (state.player.items.protectionCard <= 0) return state;
      
      return {
        ...state,
        player: {
          ...state.player,
          items: {
            ...state.player.items,
            protectionCard: state.player.items.protectionCard - 1,
          },
          protectionTimeEnd: Date.now() + 2 * 60 * 60 * 1000,
        },
      };
    }
    
    case 'DAILY_RESET': {
      const today = new Date().toDateString();
      if (state.player.lastSignInDate === today) return state;
      
      return {
        ...state,
        player: {
          ...state.player,
          dailyStealsRemaining: 10 + Math.floor(state.player.level / 2),
        },
        dailyTasks: state.dailyTasks.map(task => ({
          ...task,
          current: 0,
          completed: false,
          claimed: false,
        })),
      };
    }
    
    case 'SET_FRIENDS': {
      return {
        ...state,
        friends: action.payload,
      };
    }
    
    default:
      return state;
  }
};

const saveGameState = (state: GameState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

const loadGameState = (): GameState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as GameState;
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  return null;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState());
  
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: savedState });
    }
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_CROP_GROWTH' });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (state.lastUpdate > 0) {
      saveGameState(state);
    }
  }, [state]);
  
  const plowPlot = (plotId: string) => {
    dispatch({ type: 'PLOW_PLOT', payload: { plotId } });
  };
  
  const plantCrop = (plotId: string, cropType: CropType) => {
    dispatch({ type: 'PLANT_CROP', payload: { plotId, cropType } });
  };
  
  const harvestCrop = (plotId: string) => {
    dispatch({ type: 'HARVEST_CROP', payload: { plotId } });
  };
  
  const useItem = (plotId: string, itemType: ItemType) => {
    dispatch({ type: 'USE_ITEM', payload: { plotId, itemType } });
  };
  
  const sellCrop = (cropType: CropType, quantity: number) => {
    dispatch({ type: 'SELL_CROP', payload: { cropType, quantity } });
  };
  
  const addGold = (amount: number) => {
    dispatch({ type: 'ADD_GOLD', payload: { amount } });
  };
  
  const addExperience = (experience: number) => {
    dispatch({ type: 'ADD_EXPERIENCE', payload: { experience } });
  };
  
  const buyItem = (itemType: ItemType, price: number) => {
    dispatch({ type: 'BUY_ITEM', payload: { itemType, price } });
  };
  
  const buySeed = (cropType: CropType, price: number) => {
    dispatch({ type: 'BUY_SEED', payload: { cropType, price } });
  };
  
  const updateTaskProgress = (taskId: string, progress: number) => {
    dispatch({ type: 'UPDATE_TASK_PROGRESS', payload: { taskId, progress } });
  };
  
  const claimTaskReward = (taskId: string) => {
    dispatch({ type: 'CLAIM_TASK_REWARD', payload: { taskId } });
  };
  
  const stealFromFriend = (friendId: string, plotId: string) => {
    dispatch({ type: 'STEAL_FROM_FRIEND', payload: { friendId, plotId } });
  };
  
  const useProtectionCard = () => {
    dispatch({ type: 'USE_PROTECTION_CARD' });
  };
  
  const setFriends = (friends: Friend[]) => {
    dispatch({ type: 'SET_FRIENDS', payload: friends });
  };
  
  const value: GameContextType = {
    state,
    dispatch,
    plowPlot,
    plantCrop,
    harvestCrop,
    useItem,
    sellCrop,
    addGold,
    addExperience,
    buyItem,
    buySeed,
    updateTaskProgress,
    claimTaskReward,
    stealFromFriend,
    useProtectionCard,
    setFriends,
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
