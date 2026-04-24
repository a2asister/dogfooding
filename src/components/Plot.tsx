import React, { useMemo } from 'react';
import type { Plot as PlotType } from '../types';
import { getCropGrowthProgress, formatTimeRemaining } from '../utils/gameUtils';
import { CROPS, ITEM_INFO } from '../config/gameConfig';
import './Plot.css';

interface PlotProps {
  plot: PlotType;
  onSelect: () => void;
  isSelected: boolean;
}

const PlotComponent: React.FC<PlotProps> = ({ plot, onSelect, isSelected }) => {
  const growthInfo = useMemo(() => {
    if (!plot.crop) return null;
    return getCropGrowthProgress(plot.crop);
  }, [plot.crop]);
  
  const cropInfo = useMemo(() => {
    if (!plot.crop) return null;
    return CROPS[plot.crop.type];
  }, [plot.crop]);
  
  const getPlotClasses = (): string => {
    const classes = ['plot'];
    
    if (isSelected) {
      classes.push('plot-selected');
    }
    
    if (plot.status === 'ready') {
      classes.push('plot-ready');
    } else if (plot.status === 'growing') {
      classes.push('plot-growing');
    } else if (plot.status === 'plowed') {
      classes.push('plot-plowed');
    } else if (plot.status === 'empty') {
      classes.push('plot-empty');
    } else if (plot.status === 'withered') {
      classes.push('plot-withered');
    }
    
    if (plot.hasWeed) {
      classes.push('has-weed');
    }
    
    if (plot.hasPest) {
      classes.push('has-pest');
    }
    
    return classes.join(' ');
  };
  
  const getCropEmoji = (): string => {
    if (!cropInfo || !growthInfo) return '';
    
    if (plot.status === 'ready') {
      return cropInfo.emoji;
    }
    
    const stageEmojis: Record<string, string[]> = {
      wheat: ['🌱', '🌿', '🌾', '🌾'],
      carrot: ['🌱', '🌿', '🥕', '🥕'],
      cabbage: ['🌱', '🌿', '🥬', '🥬'],
    };
    
    const emojis = stageEmojis[plot.crop!.type] || ['🌱', '🌱', '🌱', '🌱'];
    return emojis[Math.min(growthInfo.currentStage, emojis.length - 1)];
  };
  
  const getStatusText = (): string => {
    switch (plot.status) {
      case 'empty':
        return '点击耕地';
      case 'plowed':
        return '点击播种';
      case 'growing':
        return growthInfo ? formatTimeRemaining(growthInfo.timeRemaining) : '生长中';
      case 'ready':
        return '点击收获';
      case 'withered':
        return '已枯萎';
      default:
        return '';
    }
  };
  
  const getGrowthPercent = (): number => {
    if (!growthInfo) return 0;
    return growthInfo.progress;
  };
  
  return (
    <div
      className={getPlotClasses()}
      onClick={onSelect}
    >
      <div className="plot-content">
        {plot.status === 'empty' && (
          <div className="plot-icon plot-empty-icon">
            <span>🟫</span>
          </div>
        )}
        
        {plot.status === 'plowed' && (
          <div className="plot-icon plot-plowed-icon">
            <span>🌱</span>
          </div>
        )}
        
        {(plot.status === 'growing' || plot.status === 'ready') && plot.crop && (
          <div className="crop-container">
            <div className={`crop-emoji ${plot.status === 'ready' ? 'animate-bounce' : ''}`}>
              {getCropEmoji()}
            </div>
            
            {plot.status === 'growing' && (
              <div className="growth-info">
                <div className="growth-bar-bg">
                  <div
                    className="growth-bar-fill"
                    style={{ width: `${getGrowthPercent()}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {plot.status === 'withered' && (
          <div className="plot-icon plot-withered-icon">
            <span>💀</span>
          </div>
        )}
        
        {(plot.hasWeed || plot.hasPest) && (
          <div className="plot-overlays">
            {plot.hasWeed && (
              <div className="overlay-icon weed-icon" title="杂草">
                🌿
              </div>
            )}
            {plot.hasPest && (
              <div className="overlay-icon pest-icon" title="害虫">
                🐛
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="plot-status">
        <span className="status-text">{getStatusText()}</span>
        {plot.status === 'ready' && cropInfo && (
          <span className="sell-price">
            {ITEM_INFO.fertilizer.emoji} +{cropInfo.sellPrice}金币
          </span>
        )}
      </div>
      
      {plot.status === 'growing' && growthInfo && (
        <div className="time-remaining-tooltip">
          {formatTimeRemaining(growthInfo.timeRemaining)}
        </div>
      )}
    </div>
  );
};

export default PlotComponent;
