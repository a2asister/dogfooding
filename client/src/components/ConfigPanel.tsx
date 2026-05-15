import { memo, useCallback } from 'react';
import { ButtonAnimationConfig } from '../types';

type ConfigUpdater = (prev: ButtonAnimationConfig) => ButtonAnimationConfig;

interface ConfigPanelProps {
  config: ButtonAnimationConfig;
  onChange: (update: ButtonAnimationConfig | ConfigUpdater) => void;
}

const ColorInput = memo(({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label style={{ fontSize: '12px', color: '#6b7280' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        type="color"
        value={value.startsWith('#') ? value : '#6366f1'}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '40px', height: '32px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #d1d5db' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
      />
    </div>
  </div>
));

ColorInput.displayName = 'ColorInput';

const SliderInput = memo(({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', cursor: 'pointer' }}
    />
  </div>
));

SliderInput.displayName = 'SliderInput';

const TextInput = memo(({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label style={{ fontSize: '12px', color: '#6b7280' }}>{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
    />
  </div>
));

TextInput.displayName = 'TextInput';

const SelectInput = memo(({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label style={{ fontSize: '12px', color: '#6b7280' }}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
));

SelectInput.displayName = 'SelectInput';

const Section = memo(({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
    <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>{title}</h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {children}
    </div>
  </div>
));

Section.displayName = 'Section';

const animationTypeOptions = [{ value: 'spring', label: '弹性' }, { value: 'tween', label: '渐变' }];
const easeOptions = [
  { value: 'easeOut', label: 'easeOut' },
  { value: 'easeIn', label: 'easeIn' },
  { value: 'easeInOut', label: 'easeInOut' },
  { value: 'linear', label: 'linear' }
];

export const ConfigPanel = memo(function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  const updateConfig = useCallback(<K extends keyof ButtonAnimationConfig>(
    key: K,
    value: ButtonAnimationConfig[K]
  ) => {
    onChange((prev: ButtonAnimationConfig) => ({ ...prev, [key]: value }));
  }, [onChange]);

  const updateNested = useCallback(<
    K extends keyof ButtonAnimationConfig,
    N extends keyof ButtonAnimationConfig[K]
  >(
    key: K,
    nestedKey: N,
    value: ButtonAnimationConfig[K][N]
  ) => {
    onChange((prev: ButtonAnimationConfig) => ({
      ...prev,
      [key]: { ...prev[key], [nestedKey]: value }
    }));
  }, [onChange]);

  const handleNameChange = useCallback((v: string) => updateConfig('name', v), [updateConfig]);
  
  const handleBaseBackgroundColor = useCallback((v: string) => updateNested('baseStyle', 'backgroundColor', v), [updateNested]);
  const handleBaseTextColor = useCallback((v: string) => updateNested('baseStyle', 'textColor', v), [updateNested]);
  const handleBaseFontSize = useCallback((v: number) => updateNested('baseStyle', 'fontSize', v), [updateNested]);
  const handleBaseFontWeight = useCallback((v: number) => updateNested('baseStyle', 'fontWeight', v), [updateNested]);
  const handleBasePaddingX = useCallback((v: number) => updateNested('baseStyle', 'paddingX', v), [updateNested]);
  const handleBasePaddingY = useCallback((v: number) => updateNested('baseStyle', 'paddingY', v), [updateNested]);
  const handleBaseBorderRadius = useCallback((v: number) => updateNested('baseStyle', 'borderRadius', v), [updateNested]);
  const handleBaseBorderWidth = useCallback((v: number) => updateNested('baseStyle', 'borderWidth', v), [updateNested]);
  const handleBaseBorderColor = useCallback((v: string) => updateNested('baseStyle', 'borderColor', v), [updateNested]);
  const handleBaseBoxShadow = useCallback((v: string) => updateNested('baseStyle', 'boxShadow', v), [updateNested]);

  const handleHoverBackgroundColor = useCallback((v: string) => updateNested('hoverStyle', 'backgroundColor', v), [updateNested]);
  const handleHoverTextColor = useCallback((v: string) => updateNested('hoverStyle', 'textColor', v), [updateNested]);
  const handleHoverScale = useCallback((v: number) => updateNested('hoverStyle', 'scale', v), [updateNested]);
  const handleHoverTranslateY = useCallback((v: number) => updateNested('hoverStyle', 'translateY', v), [updateNested]);
  const handleHoverBoxShadow = useCallback((v: string) => updateNested('hoverStyle', 'boxShadow', v), [updateNested]);

  const handleActiveBackgroundColor = useCallback((v: string) => updateNested('activeStyle', 'backgroundColor', v), [updateNested]);
  const handleActiveScale = useCallback((v: number) => updateNested('activeStyle', 'scale', v), [updateNested]);
  const handleActiveTranslateY = useCallback((v: number) => updateNested('activeStyle', 'translateY', v), [updateNested]);

  const handleLoadingBackgroundColor = useCallback((v: string) => updateNested('loadingStyle', 'backgroundColor', v), [updateNested]);
  const handleLoadingSpinnerColor = useCallback((v: string) => updateNested('loadingStyle', 'spinnerColor', v), [updateNested]);
  const handleLoadingSpinnerSize = useCallback((v: number) => updateNested('loadingStyle', 'spinnerSize', v), [updateNested]);

  const handleSuccessBackgroundColor = useCallback((v: string) => updateNested('successStyle', 'backgroundColor', v), [updateNested]);
  const handleSuccessTextColor = useCallback((v: string) => updateNested('successStyle', 'textColor', v), [updateNested]);
  const handleSuccessIconColor = useCallback((v: string) => updateNested('successStyle', 'iconColor', v), [updateNested]);

  const handleErrorBackgroundColor = useCallback((v: string) => updateNested('errorStyle', 'backgroundColor', v), [updateNested]);
  const handleErrorTextColor = useCallback((v: string) => updateNested('errorStyle', 'textColor', v), [updateNested]);
  const handleErrorIconColor = useCallback((v: string) => updateNested('errorStyle', 'iconColor', v), [updateNested]);

  const handleAnimationType = useCallback((v: string) => updateNested('animation', 'type', v as 'spring' | 'tween'), [updateNested]);
  const handleAnimationStiffness = useCallback((v: number) => updateNested('animation', 'stiffness', v), [updateNested]);
  const handleAnimationDamping = useCallback((v: number) => updateNested('animation', 'damping', v), [updateNested]);
  const handleAnimationMass = useCallback((v: number) => updateNested('animation', 'mass', v), [updateNested]);
  const handleAnimationDuration = useCallback((v: number) => updateNested('animation', 'duration', v), [updateNested]);
  const handleAnimationEase = useCallback((v: string) => updateNested('animation', 'ease', v), [updateNested]);

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      <Section title="基础配置">
        <TextInput label="按钮名称" value={config.name} onChange={handleNameChange} />
      </Section>

      <Section title="基础样式">
        <ColorInput label="背景颜色" value={config.baseStyle.backgroundColor} onChange={handleBaseBackgroundColor} />
        <ColorInput label="文字颜色" value={config.baseStyle.textColor} onChange={handleBaseTextColor} />
        <SliderInput label="字体大小" value={config.baseStyle.fontSize} min={8} max={72} step={1} onChange={handleBaseFontSize} />
        <SliderInput label="字体粗细" value={config.baseStyle.fontWeight} min={100} max={900} step={100} onChange={handleBaseFontWeight} />
        <SliderInput label="水平内边距" value={config.baseStyle.paddingX} min={0} max={100} step={1} onChange={handleBasePaddingX} />
        <SliderInput label="垂直内边距" value={config.baseStyle.paddingY} min={0} max={100} step={1} onChange={handleBasePaddingY} />
        <SliderInput label="圆角" value={config.baseStyle.borderRadius} min={0} max={100} step={1} onChange={handleBaseBorderRadius} />
        <SliderInput label="边框宽度" value={config.baseStyle.borderWidth} min={0} max={20} step={1} onChange={handleBaseBorderWidth} />
        <ColorInput label="边框颜色" value={config.baseStyle.borderColor} onChange={handleBaseBorderColor} />
        <TextInput label="阴影" value={config.baseStyle.boxShadow} onChange={handleBaseBoxShadow} />
      </Section>

      <Section title="悬停样式">
        <ColorInput label="背景颜色" value={config.hoverStyle.backgroundColor} onChange={handleHoverBackgroundColor} />
        <ColorInput label="文字颜色" value={config.hoverStyle.textColor} onChange={handleHoverTextColor} />
        <SliderInput label="缩放比例" value={config.hoverStyle.scale} min={0.5} max={2} step={0.01} onChange={handleHoverScale} />
        <SliderInput label="向上偏移" value={config.hoverStyle.translateY} min={-50} max={0} step={1} onChange={handleHoverTranslateY} />
        <TextInput label="阴影" value={config.hoverStyle.boxShadow} onChange={handleHoverBoxShadow} />
      </Section>

      <Section title="点击样式">
        <ColorInput label="背景颜色" value={config.activeStyle.backgroundColor} onChange={handleActiveBackgroundColor} />
        <SliderInput label="缩放比例" value={config.activeStyle.scale} min={0.5} max={2} step={0.01} onChange={handleActiveScale} />
        <SliderInput label="向上偏移" value={config.activeStyle.translateY} min={-50} max={50} step={1} onChange={handleActiveTranslateY} />
      </Section>

      <Section title="加载样式">
        <ColorInput label="背景颜色" value={config.loadingStyle.backgroundColor} onChange={handleLoadingBackgroundColor} />
        <ColorInput label="加载器颜色" value={config.loadingStyle.spinnerColor} onChange={handleLoadingSpinnerColor} />
        <SliderInput label="加载器大小" value={config.loadingStyle.spinnerSize} min={10} max={100} step={1} onChange={handleLoadingSpinnerSize} />
      </Section>

      <Section title="成功样式">
        <ColorInput label="背景颜色" value={config.successStyle.backgroundColor} onChange={handleSuccessBackgroundColor} />
        <ColorInput label="文字颜色" value={config.successStyle.textColor} onChange={handleSuccessTextColor} />
        <ColorInput label="图标颜色" value={config.successStyle.iconColor} onChange={handleSuccessIconColor} />
      </Section>

      <Section title="错误样式">
        <ColorInput label="背景颜色" value={config.errorStyle.backgroundColor} onChange={handleErrorBackgroundColor} />
        <ColorInput label="文字颜色" value={config.errorStyle.textColor} onChange={handleErrorTextColor} />
        <ColorInput label="图标颜色" value={config.errorStyle.iconColor} onChange={handleErrorIconColor} />
      </Section>

      <Section title="动画配置">
        <SelectInput
          label="动画类型"
          value={config.animation.type}
          options={animationTypeOptions}
          onChange={handleAnimationType}
        />
        <SliderInput label="刚度" value={config.animation.stiffness} min={10} max={1000} step={10} onChange={handleAnimationStiffness} />
        <SliderInput label="阻尼" value={config.animation.damping} min={1} max={100} step={1} onChange={handleAnimationDamping} />
        <SliderInput label="质量" value={config.animation.mass} min={0.1} max={10} step={0.1} onChange={handleAnimationMass} />
        <SliderInput label="持续时间" value={config.animation.duration} min={0.1} max={5} step={0.1} onChange={handleAnimationDuration} />
        <SelectInput
          label="缓动函数"
          value={config.animation.ease}
          options={easeOptions}
          onChange={handleAnimationEase}
        />
      </Section>
    </div>
  );
});
