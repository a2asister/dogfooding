import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import PlotComponent from './Plot';
import ActionPanel from './ActionPanel';
import Warehouse from './Warehouse';
import type { Plot } from '../types';
import './FarmView.css';

const FarmView: React.FC = () => {
  const { state } = useGameContext();
  const { plots, player } = state;
  
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [showWarehouse, setShowWarehouse] = useState(false);
  
  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot);
  };
  
  const handleCloseActionPanel = () => {
    setSelectedPlot(null);
  };
  
  return (
    <div className="farm-view">
      <div className="farm-container">
        <div className="farm-header-info">
          <div className="info-item">
            <span className="info-icon">🌱</span>
            <span className="info-text">地块: {plots.length}块</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💩</span>
            <span className="info-text">肥料: {player.items.fertilizer}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🧪</span>
            <span className="info-text">除草剂: {player.items.herbicide}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💊</span>
            <span className="info-text">杀虫剂: {player.items.pesticide}</span>
          </div>
        </div>
        
        <div className="farm-plots">
          {plots.map((plot) => (
            <PlotComponent
              key={plot.id}
              plot={plot}
              onSelect={() => handlePlotClick(plot)}
              isSelected={selectedPlot?.id === plot.id}
            />
          ))}
        </div>
        
        <div className="farm-tips">
          <p>💡 提示：点击地块进行操作</p>
          <p>🌱 耕地 → 选择种子播种 → 等待成熟 → 收获</p>
        </div>
      </div>
      
      {selectedPlot && (
        <ActionPanel
          selectedPlot={selectedPlot}
          onClose={handleCloseActionPanel}
        />
      )}
      
      {showWarehouse && (
        <Warehouse onClose={() => setShowWarehouse(false)} />
      )}
    </div>
  );
};

export default FarmView;
