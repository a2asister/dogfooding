import React from 'react';
import { useGameContext } from '../context/GameContext';
import './Header.css';

const Header: React.FC = () => {
  const { state } = useGameContext();
  const { player } = state;
  
  const experiencePercent = (player.experience / player.experienceToNextLevel) * 100;
  
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="farm-title">
            <span className="title-emoji">🏡</span>
            <span className="title-text">我的农场</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="stats-group">
            <div className="stat-item level-stat">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">Lv.{player.level}</span>
            </div>
            
            <div className="stat-item exp-stat">
              <div className="exp-bar-container">
                <div className="exp-bar-bg">
                  <div 
                    className="exp-bar-fill"
                    style={{ width: `${experiencePercent}%` }}
                  />
                </div>
                <span className="exp-text">
                  {player.experience}/{player.experienceToNextLevel}
                </span>
              </div>
            </div>
            
            <div className="stat-item gold-stat">
              <span className="stat-icon">💰</span>
              <span className="stat-value">{player.gold}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
