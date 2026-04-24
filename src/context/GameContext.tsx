import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { GameState, CropType, ItemType, WarehouseItem } from '../types';
import { createInitialGameState, createCropInstance, addExperience, getCropGrowthProgress } from '../utils/gameUtils';
import { CROPS, FERTILIZER_SPEED_BOOST, STORAGE_KEY } from '../config/gameConfig';

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
  | { type: 'ADD_ITEM'; payload: { itemType: ItemType; quantity: number } };

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
}

const GameContext = createContext<GameContextType | undefined>(undefined);

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
      
      return {
        ...state,
        plots: updatedPlots,
        player: playerWithExp.player,
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
      
      return {
        ...state,
        plots: updatedPlots,
        player: playerWithExp.player,
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
            return {
              ...plot,
              crop: {
                ...plot.crop,
                growthSpeedMultiplier: plot.crop.growthSpeedMultiplier * (1 + FERTILIZER_SPEED_BOOST),
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
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + goldEarned,
          warehouse: updatedWarehouse,
        },
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
