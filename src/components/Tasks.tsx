import React from 'react';
import { useGameContext } from '../context/GameContext';
import { ITEM_INFO } from '../config/gameConfig';
import type { DailyTask } from '../types';
import './Tasks.css';

const Tasks: React.FC = () => {
  const { state, claimTaskReward } = useGameContext();
  const { dailyTasks, player } = state;

  const getProgressPercent = (task: DailyTask): number => {
    return Math.min((task.current / task.target) * 100, 100);
  };

  const formatReward = (task: DailyTask): string => {
    const rewards: string[] = [];

    if (task.reward.gold) {
      rewards.push(`💰 ${task.reward.gold}金币`);
    }
    if (task.reward.experience) {
      rewards.push(`⭐ ${task.reward.experience}经验`);
    }
    if (task.reward.items) {
      Object.entries(task.reward.items).forEach(([itemType, quantity]) => {
        if (quantity) {
          const itemName = ITEM_INFO[itemType as keyof typeof ITEM_INFO]?.name || itemType;
          rewards.push(`${ITEM_INFO[itemType as keyof typeof ITEM_INFO]?.emoji || '📦'} ${itemName} x${quantity}`);
        }
      });
    }

    return rewards.join(' | ');
  };

  const handleClaimReward = (taskId: string) => {
    claimTaskReward(taskId);
  };

  const completedCount = dailyTasks.filter(t => t.completed).length;
  const claimedCount = dailyTasks.filter(t => t.claimed).length;

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h2>📋 每日任务</h2>
        <div className="task-stats">
          <span className="stat-text">已完成: {completedCount}/{dailyTasks.length}</span>
        </div>
      </div>

      <div className="tasks-progress-summary">
        <div className="summary-info">
          <span className="summary-text">
            {claimedCount === dailyTasks.length
              ? '🎉 今日任务全部完成！'
              : `还有 ${dailyTasks.length - claimedCount} 个任务奖励待领取`}
          </span>
        </div>
      </div>

      {dailyTasks.length === 0 ? (
        <div className="no-tasks">
          <span className="no-tasks-icon">📋</span>
          <p>今日暂无任务</p>
          <p className="hint">完成任务获取丰厚奖励~</p>
        </div>
      ) : (
        <div className="tasks-list">
          {dailyTasks.map((task) => {
            const progressPercent = getProgressPercent(task);
            const isCompleted = task.completed;
            const isClaimed = task.claimed;

            return (
              <div
                key={task.id}
                className={`task-card ${isCompleted ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}`}
              >
                <div className="task-header">
                  <div className="task-title">
                    <span className={`task-icon ${isClaimed ? 'claimed' : ''}`}>
                      {isClaimed ? '✅' : isCompleted ? '🎁' : '📋'}
                    </span>
                    <div className="task-info">
                      <span className="task-name">{task.name}</span>
                      <span className="task-description">{task.description}</span>
                    </div>
                  </div>

                  {!isClaimed && isCompleted && (
                    <button
                      className="claim-btn"
                      onClick={() => handleClaimReward(task.id)}
                    >
                      领取奖励
                    </button>
                  )}

                  {isClaimed && (
                    <span className="claimed-badge">已领取</span>
                  )}
                </div>

                <div className="task-progress">
                  <div className="progress-info">
                    <span className="progress-text">
                      进度: {task.current}/{task.target}
                    </span>
                    <span className="reward-text">
                      奖励: {formatReward(task)}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-bg">
                      <div
                        className={`progress-bar-fill ${isCompleted ? 'completed' : ''}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="progress-percent">{Math.floor(progressPercent)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;