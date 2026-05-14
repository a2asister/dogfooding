import { jsx as _jsx, jsxs as _jsxs } from "@builder.io/qwik/jsx-runtime";
import { component$, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { FissionCanvas } from './FissionCanvas';
import { ControlPanel } from './ControlPanel';
import { api } from '~/services/api';
const defaultConfig = {
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
    const state = useStore({
        config: { ...defaultConfig },
        isPlaying: true,
        resetKey: 0,
    });
    const handleConfigChange = $((config) => {
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
            }
            catch {
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
            }
            catch {
                alert('保存失败，请确保后端服务已启动');
            }
        }
    });
    useVisibleTask$(() => {
        state.isPlaying = true;
    });
    return (_jsx("div", { style: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
            padding: '24px',
        }, children: _jsxs("div", { style: { maxWidth: '1400px', margin: '0 auto' }, children: [_jsxs("header", { style: { marginBottom: '24px', textAlign: 'center' }, children: [_jsx("h1", { style: {
                                margin: '0 0 8px 0',
                                color: '#fff',
                                fontSize: '32px',
                                fontWeight: '700',
                                background: 'linear-gradient(90deg, #667eea, #f093fb)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }, children: "\u51E0\u4F55\u88C2\u53D8\u52A8\u753B\u5DE5\u5177" }), _jsx("p", { style: { margin: 0, color: '#aaa', fontSize: '14px' }, children: "\u6781\u7B80\u9AD8\u7EA7\u52A8\u6001\u89C6\u89C9\u521B\u4F5C\u5E73\u53F0" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }, children: [_jsx("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }, children: _jsx(FissionCanvas, { config: state.config, isPlaying: state.isPlaying, "onReset$": handleReset }, state.resetKey) }), _jsx(ControlPanel, { config: state.config, "onConfigChange$": handleConfigChange, isPlaying: state.isPlaying, "onPlayToggle$": handlePlayToggle, "onSave$": handleSave, "onSaveTemplate$": handleSaveTemplate })] }), _jsx("footer", { style: { marginTop: '32px', textAlign: 'center', color: '#666', fontSize: '12px' }, children: _jsx("p", { children: "\u652F\u6301\u65E0\u9650\u88C2\u53D8 \u00B7 \u788E\u7247\u6269\u6563 \u00B7 \u65CB\u8F6C\u6392\u5E03 \u00B7 \u56DE\u5F39\u5F52\u4F4D \u00B7 \u6E10\u53D8\u586B\u5145" }) })] }) }));
});
