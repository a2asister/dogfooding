import { component$, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { FissionCanvas } from './FissionCanvas';
import { ControlPanel } from './ControlPanel';
import type { FissionConfig } from '~/types/geometric';
import { api } from '~/services/api';

const defaultConfig: FissionConfig = {
  shapeType: 'hexagon',
  fissionCount: 30,
  speed: 3,
  spreadRange: 300,
  rotationSpeed: 0.1,
  colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
  trailEnabled: true,
  bounceEnabled: true,
  gravityEnabled: false,
};

export const App = component$(() => {
  const state = useStore<{
    config: FissionConfig;
    isPlaying: boolean;
    resetKey: number;
  }>({
    config: { ...defaultConfig },
    isPlaying: true,
    resetKey: 0,
  });

  const handleConfigChange = $((config: FissionConfig) => {
    state.config = config;
    state.resetKey++;
  });

  const handlePlayToggle = $(() => {
    state.isPlaying = !state.isPlaying;
  });

  const handleReset = $(() => {
    state.resetKey++;
  });

  const handleSave = $(async () => {
    const name = prompt('请输入作品名称:');
    if (name) {
      try {
        await api.saveWork(name, state.config, '');
        alert('保存成功！');
      } catch {
        alert('保存失败，请确保后端服务已启动');
      }
    }
  });

  const handleSaveTemplate = $(async () => {
    const name = prompt('请输入模板名称:');
    if (name) {
      try {
        await api.saveTemplate(name, state.config, '', '自定义');
        alert('模板保存成功！');
      } catch {
        alert('保存失败，请确保后端服务已启动');
      }
    }
  });

  useVisibleTask$(() => {
    state.isPlaying = true;
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1
            style={{
              margin: '0 0 8px 0',
              color: '#fff',
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(90deg, #667eea, #f093fb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            几何裂变动画工具
          </h1>
          <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>
            极简高级动态视觉创作平台
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <FissionCanvas
              key={state.resetKey}
              config={state.config}
              isPlaying={state.isPlaying}
              onReset$={handleReset}
            />
          </div>

          <ControlPanel
            config={state.config}
            onConfigChange$={handleConfigChange}
            isPlaying={state.isPlaying}
            onPlayToggle$={handlePlayToggle}
            onSave$={handleSave}
            onSaveTemplate$={handleSaveTemplate}
          />
        </div>

        <footer style={{ marginTop: '32px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
          <p>支持无限裂变 · 碎片扩散 · 旋转排布 · 回弹归位 · 渐变填充</p>
        </footer>
      </div>
    </div>
  );
});
