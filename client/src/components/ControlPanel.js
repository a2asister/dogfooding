import { jsx as _jsx, jsxs as _jsxs } from "@builder.io/qwik/jsx-runtime";
import { component$, $ } from '@builder.io/qwik';
const shapeTypes = ['circle', 'triangle', 'square', 'pentagon', 'hexagon'];
const presetColors = [
    ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
    ['#00c6fb', '#005bea', '#00f5a0', '#a855f7'],
    ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
    ['#1dd1a1', '#5f27cd', '#ff6b6b', '#ffd93d'],
];
export const ControlPanel = component$(({ config, onConfigChange$, isPlaying, onPlayToggle$, onSave$, onSaveTemplate$ }) => {
    const updateConfig = $((key, value) => {
        onConfigChange$({ ...config, [key]: value });
    });
    const shapeLabels = {
        circle: '圆形',
        triangle: '三角形',
        square: '正方形',
        pentagon: '五边形',
        hexagon: '六边形',
    };
    return (_jsxs("div", { style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        }, children: [_jsx("h3", { style: { margin: '0 0 20px 0', color: '#fff', fontSize: '18px' }, children: "\u63A7\u5236\u9762\u677F" }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: { display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }, children: "\u56FE\u5F62\u7C7B\u578B" }), _jsx("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' }, children: shapeTypes.map((shape) => (_jsx("button", { "onClick$": () => updateConfig('shapeType', shape), style: {
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                background: config.shapeType === shape ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                fontSize: '14px',
                                transition: 'all 0.3s',
                            }, children: shapeLabels[shape] }, shape))) })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("label", { style: { display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }, children: ["\u88C2\u53D8\u6570\u91CF: ", config.fissionCount] }), _jsx("input", { type: "range", min: 5, max: 100, value: config.fissionCount, "onInput$": (e) => updateConfig('fissionCount', Number(e.target.value)), style: { width: '100%', accentColor: '#667eea' } })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("label", { style: { display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }, children: ["\u6269\u6563\u901F\u5EA6: ", config.speed.toFixed(1)] }), _jsx("input", { type: "range", min: 0.5, max: 10, step: 0.1, value: config.speed, "onInput$": (e) => updateConfig('speed', Number(e.target.value)), style: { width: '100%', accentColor: '#667eea' } })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("label", { style: { display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }, children: ["\u6269\u6563\u8303\u56F4: ", config.spreadRange] }), _jsx("input", { type: "range", min: 100, max: 500, value: config.spreadRange, "onInput$": (e) => updateConfig('spreadRange', Number(e.target.value)), style: { width: '100%', accentColor: '#667eea' } })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("label", { style: { display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }, children: ["\u65CB\u8F6C\u901F\u5EA6: ", config.rotationSpeed.toFixed(2)] }), _jsx("input", { type: "range", min: 0, max: 0.5, step: 0.01, value: config.rotationSpeed, "onInput$": (e) => updateConfig('rotationSpeed', Number(e.target.value)), style: { width: '100%', accentColor: '#667eea' } })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: { display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }, children: "\u914D\u8272\u65B9\u6848" }), _jsx("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' }, children: presetColors.map((colors, index) => (_jsx("button", { "onClick$": () => updateConfig('colors', colors), style: {
                                padding: '4px',
                                borderRadius: '8px',
                                border: JSON.stringify(config.colors) === JSON.stringify(colors)
                                    ? '2px solid #667eea'
                                    : '2px solid transparent',
                                cursor: 'pointer',
                                background: 'rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                gap: '2px',
                            }, children: colors.map((color, ci) => (_jsx("div", { style: {
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    background: color,
                                } }, ci))) }, index))) })] }), _jsx("div", { style: { marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }, children: ['trailEnabled', 'bounceEnabled', 'gravityEnabled'].map((option) => {
                    const labels = {
                        trailEnabled: '显示拖尾',
                        bounceEnabled: '回弹效果',
                        gravityEnabled: '重力效果',
                    };
                    return (_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: config[option], "onChange$": (e) => updateConfig(option, e.target.checked), style: { width: '18px', height: '18px', accentColor: '#667eea' } }), labels[option]] }, option));
                }) }), _jsxs("div", { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' }, children: [_jsx("button", { "onClick$": onPlayToggle$, style: {
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
                        }, children: isPlaying ? '暂停' : '播放' }), _jsx("button", { "onClick$": onSave$, style: {
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            background: '#667eea',
                            color: '#fff',
                            fontSize: '14px',
                            transition: 'all 0.3s',
                        }, children: "\u4FDD\u5B58\u4F5C\u54C1" }), _jsx("button", { "onClick$": onSaveTemplate$, style: {
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            background: '#764ba2',
                            color: '#fff',
                            fontSize: '14px',
                            transition: 'all 0.3s',
                        }, children: "\u5B58\u4E3A\u6A21\u677F" })] })] }));
});
