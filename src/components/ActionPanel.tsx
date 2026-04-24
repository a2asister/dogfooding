import React from 'react';
import type { CropType, ItemType, Plot } from '../types';
import { useGameContext } from '../context/GameContext';
import { CROPS, ITEM_INFO } from '../config/gameConfig';
import './ActionPanel.css';

interface ActionPanelProps {
  selectedPlot: Plot | null;
  onClose: () => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ selectedPlot, onClose }) => {
  const { state, plowPlot, plantCrop, harvestCrop, useItem } = useGameContext();
  const { player } = state;
  
  if (!selectedPlot) return null;
  
  const handlePlow = () => {
    plowPlot(selectedPlot.id);
    onClose();
  };
  
  const handlePlant = (cropType: CropType) => {
    plantCrop(selectedPlot.id, cropType);
    onClose();
  };
  
  const handleHarvest = () => {
    harvestCrop(selectedPlot.id);
    onClose();
  };
  
  const handleUseItem = (itemType: ItemType) => {
    useItem(selectedPlot.id, itemType);
    onClose();
  };
  
  const availableCrops: CropType[] = ['wheat', 'carrot', 'cabbage'];
  const availableItemsForUse: { type: ItemType; condition: boolean }[] = [
    { type: 'fertilizer', condition: selectedPlot.status === 'growing' },
    { type: 'herbicide', condition: selectedPlot.hasWeed },
    { type: 'pesticide', condition: selectedPlot.hasPest },
    { type: 'speedCard', condition: selectedPlot.status === 'growing' && player.items.speedCard > 0 },
  ];
  
  return (
    <div className="action-panel-overlay" onClick={onClose}>
      <div className="action-panel" onClick={(e) => e.stopPropagation()}>
        <div className="action-panel-header">
          <h3>地块操作</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="action-panel-content">
          {selectedPlot.status === 'empty' && (
            <div className="action-section">
              <h4>耕地</h4>
              <button className="action-btn plow-btn" onClick={handlePlow}>
                🌱 开始耕地
              </button>
            </div>
          )}
          
          {selectedPlot.status === 'plowed' && (
            <div className="action-section">
              <h4>选择种子</h4>
              <div className="seed-list">
                {availableCrops.map((cropType) => {
                  const crop = CROPS[cropType];
                  const canAfford = player.gold >= crop.purchasePrice;
                  
                  return (
                    <button
                      key={cropType}
                      className={`seed-item ${!canAfford ? 'disabled' : ''}`}
                      onClick={() => canAfford && handlePlant(cropType)}
                      disabled={!canAfford}
                    >
                      <span className="seed-emoji">{crop.emoji}</span>
                      <span className="seed-name">{crop.name}</span>
                      <span className="seed-price">
                        💰 {crop.purchasePrice}金币
                      </span>
                      <span className="seed-growth-time">
                        ⏱️ {Math.floor(crop.growthTime / 60)}分钟
                      </span>
                      <span className="seed-reward">
                        💵 售价:{crop.sellPrice} | ⭐ +{crop.experience}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {selectedPlot.status === 'growing' && selectedPlot.crop && (
            <div className="action-section">
              <h4>当前作物</h4>
              <div className="current-crop-info">
                <span className="crop-emoji-large">{CROPS[selectedPlot.crop.type].emoji}</span>
                <div className="crop-details">
                  <span className="crop-name">{CROPS[selectedPlot.crop.type].name}</span>
                  <span className="crop-status">生长中...</span>
                </div>
              </div>
            </div>
          )}
          
          {(selectedPlot.status === 'growing' || selectedPlot.hasWeed || selectedPlot.hasPest) && (
            <div className="action-section">
              <h4>使用道具</h4>
              <div className="item-list">
                {availableItemsForUse.map(({ type, condition }) => {
                  if (!condition) return null;
                  
                  const itemInfo = ITEM_INFO[type];
                  const hasItem = player.items[type] > 0;
                  
                  return (
                    <button
                      key={type}
                      className={`item-btn ${!hasItem ? 'disabled' : ''}`}
                      onClick={() => hasItem && handleUseItem(type)}
                      disabled={!hasItem}
                    >
                      <span className="item-emoji">{itemInfo.emoji}</span>
                      <span className="item-name">{itemInfo.name}</span>
                      <span className="item-count">
                        剩余: {player.items[type]}
                      </span>
                      <span className="item-desc">{itemInfo.description}</span>
                    </button>
                  );
                })}
                
                {availableItemsForUse.every(({ condition }) => !condition) && (
                  <p className="no-available-items">暂无可用道具</p>
                )}
              </div>
            </div>
          )}
          
          {selectedPlot.status === 'ready' && selectedPlot.crop && (
            <div className="action-section">
              <h4>收获作物</h4>
              <div className="harvest-info">
                <span className="harvest-emoji">{CROPS[selectedPlot.crop.type].emoji}</span>
                <div className="harvest-details">
                  <span className="harvest-name">{CROPS[selectedPlot.crop.type].name}</span>
                  <span className="harvest-rewards">
                    💰 +{CROPS[selectedPlot.crop.type].sellPrice}金币 | ⭐ +{CROPS[selectedPlot.crop.type].experience}经验
                  </span>
                </div>
              </div>
              <button className="action-btn harvest-btn" onClick={handleHarvest}>
                🎉 收获作物
              </button>
            </div>
          )}
          
          {selectedPlot.status === 'withered' && (
            <div className="action-section">
              <h4>地块状态</h4>
              <div className="withered-info">
                <span>💀</span>
                <p>作物已枯萎，需要重新耕地</p>
              </div>
              <button className="action-btn plow-btn" onClick={handlePlow}>
                🔄 重新耕地
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;
