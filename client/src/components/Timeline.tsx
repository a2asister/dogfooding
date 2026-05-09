import React from 'react';
import { CareRecord, Plant } from '../types';
import { formatDateTime, careTypeLabels, careTypeIcons } from '../utils';

interface TimelineProps {
  records: CareRecord[];
  plants: Plant[];
  onDelete?: (recordId: string) => void;
}

export function Timeline({ records, plants, onDelete }: TimelineProps) {
  const getPlantById = (id: string) => plants.find(p => p.id === id);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'watering':
        return 'bg-cyan-400 dark:bg-cyan-500';
      case 'fertilizing':
        return 'bg-amber-400 dark:bg-amber-500';
      case 'pruning':
        return 'bg-pink-400 dark:bg-pink-500';
      case 'photo':
        return 'bg-plant-500 dark:bg-plant-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl mb-3 block">🌱</span>
        <p className="text-plant-500 dark:text-plant-400">暂无养护记录</p>
        <p className="text-sm text-plant-400 dark:text-plant-500 mt-1">
          开始记录你的第一次养护吧
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {records.map((record, index) => {
        const plant = getPlantById(record.plantId);
        const isLast = index === records.length - 1;

        return (
          <div key={record.id} className="relative pl-8 pb-8 last:pb-0">
            {!isLast && <div className="timeline-line" />}
            <div className={`timeline-dot absolute left-0 top-1.5 ${getTypeColor(record.type)}`} />
            
            <div className="plant-card p-4 ml-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{careTypeIcons[record.type]}</span>
                    <span className="font-medium text-plant-700 dark:text-plant-200">
                      {careTypeLabels[record.type]}
                    </span>
                    {plant && (
                      <span className="text-sm text-plant-500 dark:text-plant-400">
                        · {plant.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-plant-400 dark:text-plant-500 mb-2">
                    {formatDateTime(record.createdAt)}
                  </p>
                  {record.note && (
                    <p className="text-sm text-plant-600 dark:text-plant-300 mb-2">
                      {record.note}
                    </p>
                  )}
                  {record.photoUrl && (
                    <div className="mt-2">
                      <img 
                        src={record.photoUrl} 
                        alt="养护照片" 
                        className="max-w-xs rounded-xl shadow-sm"
                      />
                    </div>
                  )}
                </div>
                {onDelete && (
                  <button
                    onClick={() => onDelete(record.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-400 hover:text-red-500 flex-shrink-0"
                    title="删除记录"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}