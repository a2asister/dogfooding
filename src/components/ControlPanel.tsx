import React from 'react';
import { MEIOSIS_PHASES } from '../types';
import type { MeiosisPhaseId } from '../types';

interface ControlPanelProps {
  isPlaying: boolean;
  currentPhaseId: MeiosisPhaseId;
  phaseProgress: number;
  playbackSpeed: number;
  showAnnotations: boolean;
  onPlayPause: () => void;
  onPhaseChange: (phaseId: MeiosisPhaseId) => void;
  onSpeedChange: (speed: number) => void;
  onAnnotationToggle: () => void;
  onRestart: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  currentPhaseId,
  phaseProgress,
  playbackSpeed,
  showAnnotations,
  onPlayPause,
  onPhaseChange,
  onSpeedChange,
  onAnnotationToggle,
  onRestart
}) => {
  const currentPhaseIndex = MEIOSIS_PHASES.findIndex(p => p.id === currentPhaseId);
  const currentPhase = MEIOSIS_PHASES[currentPhaseIndex];
  
  const speedOptions = [0.5, 1, 2];
  const speedLabels = { 0.5: '慢速', 1: '正常', 2: '快速' };
  
  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto 24px auto',
      padding: '32px',
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#424242'
        }}>
          减数分裂演示
        </div>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: isPlaying ? '#E8F5E9' : '#FFF3E0',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            color: isPlaying ? '#388E3C' : '#F57C00'
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? '#4CAF50' : '#FF9800'
            }} />
            {isPlaying ? '播放中' : '已暂停'}
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <button
          onClick={onRestart}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#757575',
            backgroundColor: '#F5F5F5',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#EEEEEE';
            e.currentTarget.style.borderColor = '#BDBDBD';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F5F5F5';
            e.currentTarget.style.borderColor = '#E0E0E0';
          }}
        >
          重新开始
        </button>
        
        <button
          onClick={onPlayPause}
          style={{
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#FFFFFF',
            backgroundColor: isPlaying ? '#F44336' : '#4CAF50',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isPlaying ? '#D32F2F' : '#388E3C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isPlaying ? '#F44336' : '#4CAF50';
          }}
        >
          {isPlaying ? '暂停' : '播放'}
        </button>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#757575' }}>
            阶段: {currentPhase?.name || '未知'}
          </span>
          <span style={{ fontSize: '14px', color: '#757575' }}>
            进度: {Math.floor(phaseProgress * 100)}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#E0E0E0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${phaseProgress * 100}%`,
            backgroundColor: '#4CAF50',
            borderRadius: '4px',
            transition: 'width 0.1s linear'
          }} />
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#424242' }}>
          阶段跳转
        </span>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '8px'
        }}>
          {MEIOSIS_PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => onPhaseChange(phase.id)}
              style={{
                padding: '10px 12px',
                fontSize: '13px',
                fontWeight: currentPhaseId === phase.id ? '600' : '400',
                color: currentPhaseId === phase.id ? '#FFFFFF' : '#424242',
                backgroundColor: currentPhaseId === phase.id ? '#2196F3' : '#F5F5F5',
                border: currentPhaseId === phase.id ? 'none' : '1px solid #E0E0E0',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPhaseId !== phase.id) {
                  e.currentTarget.style.backgroundColor = '#EEEEEE';
                  e.currentTarget.style.borderColor = '#BDBDBD';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPhaseId !== phase.id) {
                  e.currentTarget.style.backgroundColor = '#F5F5F5';
                  e.currentTarget.style.borderColor = '#E0E0E0';
                }
              }}
            >
              {phase.name}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#424242' }}>
            播放速度
          </span>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: playbackSpeed === speed ? '600' : '400',
                  color: playbackSpeed === speed ? '#FFFFFF' : '#424242',
                  backgroundColor: playbackSpeed === speed ? '#FF9800' : '#F5F5F5',
                  border: playbackSpeed === speed ? 'none' : '1px solid #E0E0E0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (playbackSpeed !== speed) {
                    e.currentTarget.style.backgroundColor = '#EEEEEE';
                    e.currentTarget.style.borderColor = '#BDBDBD';
                  }
                }}
                onMouseLeave={(e) => {
                  if (playbackSpeed !== speed) {
                    e.currentTarget.style.backgroundColor = '#F5F5F5';
                    e.currentTarget.style.borderColor = '#E0E0E0';
                  }
                }}
              >
                {speedLabels[speed as keyof typeof speedLabels]}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#424242' }}>
            学术标注
          </span>
          <button
            onClick={onAnnotationToggle}
            style={{
              padding: '8px 24px',
              fontSize: '13px',
              fontWeight: showAnnotations ? '600' : '400',
              color: showAnnotations ? '#FFFFFF' : '#424242',
              backgroundColor: showAnnotations ? '#9C27B0' : '#F5F5F5',
              border: showAnnotations ? 'none' : '1px solid #E0E0E0',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!showAnnotations) {
                e.currentTarget.style.backgroundColor = '#EEEEEE';
                e.currentTarget.style.borderColor = '#BDBDBD';
              }
            }}
            onMouseLeave={(e) => {
              if (!showAnnotations) {
                e.currentTarget.style.backgroundColor = '#F5F5F5';
                e.currentTarget.style.borderColor = '#E0E0E0';
              }
            }}
          >
            {showAnnotations ? '显示中' : '已隐藏'}
          </button>
        </div>
      </div>
      
      {currentPhase && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#FFF8E1',
          borderRadius: '8px',
          borderLeft: '4px solid #FFC107'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#E65100',
            marginBottom: '6px'
          }}>
            {currentPhase.name} 说明
          </div>
          <div style={{
            fontSize: '13px',
            color: '#5D4037',
            lineHeight: '1.6'
          }}>
            {currentPhase.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
