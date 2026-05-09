import React from 'react';
import { Plant } from '../types';
import { formatRelativeTime, careTypeLabels } from '../utils';
import { CareButton } from './CareButton';

interface PlantCardProps {
  plant: Plant;
  onCare: (plantId: string, type: 'watering' | 'fertilizing' | 'pruning') => void;
  onViewRecords: (plantId: string) => void;
  onEdit: (plant: Plant) => void;
  onDelete: (plantId: string) => void;
}

export function PlantCard({ plant, onCare, onViewRecords, onEdit, onDelete }: PlantCardProps) {
  const getLatestCareLabel = () => {
    if (!plant.latestCareTime) return '暂无养护记录';
    const times = plant.latestCareTime;
    const latest = Object.entries(times)
      .filter(([, v]) => v)
      .sort((a, b) => new Date(b[1]!).getTime() - new Date(a[1]!).getTime())[0];
    
    if (!latest) return '暂无养护记录';
    const [type, time] = latest;
    return `上次${careTypeLabels[type]}: ${formatRelativeTime(time!)}`;
  };

  const getScheduleText = () => {
    const parts = [];
    parts.push(`浇水: ${plant.careSchedule.watering.days}天`);
    if (plant.careSchedule.fertilizing.enabled) {
      parts.push(`施肥: ${plant.careSchedule.fertilizing.days}天`);
    }
    if (plant.careSchedule.pruning.enabled) {
      parts.push(`修剪: ${plant.careSchedule.pruning.days}天`);
    }
    return parts.join(' | ');
  };

  return (
    <div className="plant-card p-5 animate-bounce-in">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-plant-100 dark:bg-plant-800/50 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
          {plant.avatarUrl ? (
            <img 
              src={plant.avatarUrl} 
              alt={plant.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span>🪴</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-plant-800 dark:text-plant-100 truncate">
              {plant.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(plant)}
                className="p-2 hover:bg-plant-100 dark:hover:bg-plant-800 rounded-lg transition-colors text-plant-500 dark:text-plant-400"
                title="编辑"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(plant.id)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                title="删除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          {plant.species && (
            <p className="text-sm text-plant-500 dark:text-plant-400 mb-1">
              {plant.species}
            </p>
          )}
          <p className="text-xs text-plant-400 dark:text-plant-500 truncate">
            {getScheduleText()}
          </p>
        </div>
      </div>

      <div 
        className="flex items-center justify-between p-3 bg-plant-50 dark:bg-plant-800/30 rounded-xl mb-4 cursor-pointer hover:bg-plant-100 dark:hover:bg-plant-800/50 transition-colors"
        onClick={() => onViewRecords(plant.id)}
      >
        <span className="text-sm text-plant-600 dark:text-plant-300">
          {getLatestCareLabel()}
        </span>
        <span className="text-plant-400 dark:text-plant-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <CareButton 
          type="watering" 
          onClick={() => onCare(plant.id, 'watering')}
        />
        {plant.careSchedule.fertilizing.enabled && (
          <CareButton 
            type="fertilizing" 
            onClick={() => onCare(plant.id, 'fertilizing')}
          />
        )}
        {plant.careSchedule.pruning.enabled && (
          <CareButton 
            type="pruning" 
            onClick={() => onCare(plant.id, 'pruning')}
          />
        )}
        <button
          onClick={() => onViewRecords(plant.id)}
          className="care-btn bg-plant-500 hover:bg-plant-600 flex flex-col items-center gap-1"
        >
          <span className="text-xl">📸</span>
          <span className="text-xs font-medium opacity-90">打卡</span>
        </button>
      </div>
    </div>
  );
}