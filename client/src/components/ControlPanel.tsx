import { component$, $ } from '@builder.io/qwik';
import type { FissionConfig, ShapeType } from '~/types/geometric';

interface ControlPanelProps {
  config: FissionConfig;
  onConfigChange$: (config: FissionConfig) => void;
  isPlaying: boolean;
  onPlayToggle$: () => void;
  onSave$: () => void;
  onSaveTemplate$: () => void;
}

const shapeTypes: ShapeType[] = ['circle', 'triangle', 'square', 'pentagon', 'hexagon'];

const presetColors = [
  ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
  ['#00c6fb', '#005bea', '#00f5a0', '#a855f7'],
  ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
  ['#1dd1a1', '#5f27cd', '#ff6b6b', '#ffd93d'],
];

export const ControlPanel = component$<ControlPanelProps>(
  ({ config, onConfigChange$, isPlaying, onPlayToggle$, onSave$, onSaveTemplate$ }) => {
    const updateConfig = $((key: keyof FissionConfig, value: unknown) => {
      onConfigChange$({ ...config, [key]: value });
    });

    const shapeLabels: Record<ShapeType, string> = {
      circle: '圆形',
      triangle: '三角形',
      square: '正方形',
      pentagon: '五边形',
      hexagon: '六边形',
    };

    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '18px' }}>控制面板</h3>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }}>
            图形类型
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {shapeTypes.map((shape) => (
              <button
                key={shape}
                onClick$={() => updateConfig('shapeType', shape)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: config.shapeType === shape ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                }}
              >
                {shapeLabels[shape]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }}>
            裂变数量: {config.fissionCount}
          </label>
          <input
            type="range"
            min={5}
            max={100}
            value={config.fissionCount}
            onInput$={(e) => updateConfig('fissionCount', Number((e.target as HTMLInputElement).value))}
            style={{ width: '100%', accentColor: '#667eea' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }}>
            扩散速度: {config.speed.toFixed(1)}
          </label>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.1}
            value={config.speed}
            onInput$={(e) => updateConfig('speed', Number((e.target as HTMLInputElement).value))}
            style={{ width: '100%', accentColor: '#667eea' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }}>
            扩散范围: {config.spreadRange}
          </label>
          <input
            type="range"
            min={100}
            max={500}
            value={config.spreadRange}
            onInput$={(e) => updateConfig('spreadRange', Number((e.target as HTMLInputElement).value))}
            style={{ width: '100%', accentColor: '#667eea' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }}>
            旋转速度: {config.rotationSpeed.toFixed(2)}
          </label>
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={config.rotationSpeed}
            onInput$={(e) => updateConfig('rotationSpeed', Number((e.target as HTMLInputElement).value))}
            style={{ width: '100%', accentColor: '#667eea' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }}>
            配色方案
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {presetColors.map((colors, index) => (
              <button
                key={index}
                onClick$={() => updateConfig('colors', colors)}
                style={{
                  padding: '4px',
                  borderRadius: '8px',
                  border:
                    JSON.stringify(config.colors) === JSON.stringify(colors)
                      ? '2px solid #667eea'
                      : '2px solid transparent',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  gap: '2px',
                }}
              >
                {colors.map((color, ci) => (
                  <div
                    key={ci}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      background: color,
                    }}
                  />
                ))}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(['trailEnabled', 'bounceEnabled', 'gravityEnabled'] as const).map((option) => {
            const labels: Record<string, string> = {
              trailEnabled: '显示拖尾',
              bounceEnabled: '回弹效果',
              gravityEnabled: '重力效果',
            };
            return (
              <label
                key={option}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={config[option]}
                  onChange$={(e) => updateConfig(option, (e.target as HTMLInputElement).checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#667eea' }}
                />
                {labels[option]}
              </label>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick$={onPlayToggle$}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: isPlaying ? '#f5576c' : '#4ECDC4',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s',
            }}
          >
            {isPlaying ? '暂停' : '播放'}
          </button>
          <button
            onClick$={onSave$}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: '#667eea',
              color: '#fff',
              fontSize: '14px',
              transition: 'all 0.3s',
            }}
          >
            保存作品
          </button>
          <button
            onClick$={onSaveTemplate$}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: '#764ba2',
              color: '#fff',
              fontSize: '14px',
              transition: 'all 0.3s',
            }}
          >
            存为模板
          </button>
        </div>
      </div>
    );
  }
);
