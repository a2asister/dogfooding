import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { CROPS } from '../config/gameConfig';
import type { Friend, Plot } from '../types';
import './Friends.css';

const Friends: React.FC = () => {
  const { state, stealFromFriend } = useGameContext();
  const { friends, player } = state;
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  
  const selectedFriend = selectedFriendId 
    ? friends.find(f => f.id === selectedFriendId) || null 
    : null;

  const getCropEmoji = (plot: Plot): string => {
    if (!plot.crop) return '';
    const crop = CROPS[plot.crop.type];
    if (!crop) return '';

    if (plot.status === 'ready') {
      return crop.emoji;
    }

    const stageEmojis: Record<string, string[]> = {
      wheat: ['🌱', '🌿', '🌾', '🌾'],
      carrot: ['🌱', '🌿', '🥕', '🥕'],
      cabbage: ['🌱', '🌿', '🥬', '🥬'],
    };

    const emojis = stageEmojis[plot.crop.type] || ['🌱', '🌱', '🌱', '🌱'];
    return emojis[Math.min(plot.crop.currentStage, emojis.length - 1)];
  };

  const getPlotStatusText = (plot: Plot): string => {
    switch (plot.status) {
      case 'empty':
        return '空';
      case 'plowed':
        return '已耕地';
      case 'growing':
        return '生长中';
      case 'ready':
        return '可收获';
      case 'withered':
        return '已枯萎';
      default:
        return '';
    }
  };

  const handleSteal = (friendId: string, plotId: string) => {
    stealFromFriend(friendId, plotId);
  };

  const handleCloseFriendView = () => {
    setSelectedFriendId(null);
  };

  if (selectedFriend) {
    const hasReadyCrops = selectedFriend.plots.some(p => p.status === 'ready');

    return (
      <div className="friends-page">
        <div className="friend-view">
          <div className="friend-header">
            <button className="back-btn" onClick={handleCloseFriendView}>
              ← 返回
            </button>
            <div className="friend-info">
              <span className="friend-avatar-large">{selectedFriend.avatar}</span>
              <div className="friend-details">
                <span className="friend-name">{selectedFriend.name}</span>
                <span className="friend-level">Lv.{selectedFriend.level}</span>
              </div>
              {selectedFriend.isProtected && (
                <span className="protected-badge">🛡️ 保护中</span>
              )}
            </div>
          </div>

          <div className="steal-info">
            <span className="steal-remaining">
              今日剩余偷取次数: {player.dailyStealsRemaining}次
            </span>
          </div>

          <div className="friend-farm">
            <h3 className="farm-title">🌾 {selectedFriend.name}的农场</h3>
            <div className="friend-plots">
              {selectedFriend.plots.map((plot) => {
                const isReady = plot.status === 'ready';
                const canSteal = isReady && !selectedFriend.isProtected && player.dailyStealsRemaining > 0;

                return (
                  <div
                    key={plot.id}
                    className={`friend-plot ${plot.status} ${canSteal ? 'stealable' : ''}`}
                    onClick={() => canSteal && handleSteal(selectedFriend.id, plot.id)}
                  >
                    <div className="plot-content">
                      {(plot.status === 'growing' || plot.status === 'ready') && plot.crop && (
                        <span className={`crop-emoji ${isReady ? 'animate-bounce' : ''}`}>
                          {getCropEmoji(plot)}
                        </span>
                      )}
                      {plot.status === 'empty' && <span className="empty-icon">🟫</span>}
                      {plot.status === 'plowed' && <span className="plowed-icon">🌱</span>}
                      {plot.status === 'withered' && <span className="withered-icon">💀</span>}
                    </div>
                    <div className="plot-status">
                      <span className="status-text">{getPlotStatusText(plot)}</span>
                      {canSteal && (
                        <span className="steal-hint">点击偷取!</span>
                      )}
                      {isReady && selectedFriend.isProtected && (
                        <span className="protected-hint">🛡️ 受保护</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h2>👥 好友列表</h2>
        <div className="steal-count-info">
          <span>今日可偷取: {player.dailyStealsRemaining}次</span>
        </div>
      </div>

      {friends.length === 0 ? (
        <div className="no-friends">
          <span className="no-friends-icon">👥</span>
          <p>暂无好友</p>
          <p className="hint">添加好友后可以互相偷菜哦~</p>
        </div>
      ) : (
        <div className="friends-list">
          {friends.map((friend) => {
            const readyCount = friend.plots.filter(p => p.status === 'ready').length;
            const hasStealable = readyCount > 0 && !friend.isProtected && player.dailyStealsRemaining > 0;

            return (
              <div
                key={friend.id}
                className={`friend-card ${hasStealable ? 'has-stealable' : ''}`}
                onClick={() => setSelectedFriendId(friend.id)}
              >
                <div className="friend-left">
                  <span className="friend-avatar">{friend.avatar}</span>
                  <div className="friend-info">
                    <span className="friend-name">{friend.name}</span>
                    <span className="friend-level">Lv.{friend.level}</span>
                  </div>
                </div>

                <div className="friend-right">
                  {friend.isProtected && (
                    <span className="protected-badge-small">🛡️</span>
                  )}
                  {readyCount > 0 && (
                    <span className={`ready-badge ${hasStealable ? 'stealable' : ''}`}>
                      {readyCount}个可收获
                    </span>
                  )}
                  <span className="arrow-icon">›</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Friends;