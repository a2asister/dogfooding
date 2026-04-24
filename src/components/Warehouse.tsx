import React from 'react';
import { useGameContext } from '../context/GameContext';
import { CROPS } from '../config/gameConfig';
import './Warehouse.css';

interface WarehouseProps {
  onClose: () => void;
}

const Warehouse: React.FC<WarehouseProps> = ({ onClose }) => {
  const { state, sellCrop } = useGameContext();
  const { player } = state;
  
  const hasItems = player.warehouse.length > 0;
  
  const handleSell = (cropType: string, quantity: number) => {
    sellCrop(cropType as any, quantity);
  };
  
  const handleSellAll = (cropType: string) => {
    const item = player.warehouse.find(i => i.cropType === cropType);
    if (item) {
      sellCrop(cropType as any, item.quantity);
    }
  };
  
  return (
    <div className="warehouse-overlay" onClick={onClose}>
      <div className="warehouse-modal" onClick={(e) => e.stopPropagation()}>
        <div className="warehouse-header">
          <h3>🏠 仓库</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="warehouse-content">
          {!hasItems ? (
            <div className="empty-warehouse">
              <span className="empty-icon">🌾</span>
              <p>仓库空空如也</p>
              <p className="empty-hint">收获作物后会存入仓库</p>
            </div>
          ) : (
            <div className="warehouse-items">
              {player.warehouse.map((item) => {
                const crop = CROPS[item.cropType];
                if (!crop) return null;
                
                const totalValue = crop.sellPrice * item.quantity;
                
                return (
                  <div key={item.cropType} className="warehouse-item">
                    <div className="item-info">
                      <span className="item-emoji">{crop.emoji}</span>
                      <div className="item-details">
                        <span className="item-name">{crop.name}</span>
                        <span className="item-quantity">数量: {item.quantity}</span>
                        <span className="item-price">
                          单价: {crop.sellPrice}金币 | 总价: {totalValue}金币
                        </span>
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <button
                        className="sell-btn sell-one"
                        onClick={() => handleSell(item.cropType, 1)}
                        disabled={item.quantity < 1}
                      >
                        卖1个
                      </button>
                      <button
                        className="sell-btn sell-all"
                        onClick={() => handleSellAll(item.cropType)}
                      >
                        全部卖出
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="warehouse-footer">
          <div className="footer-info">
            <span>💰 当前金币: {player.gold}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Warehouse;
