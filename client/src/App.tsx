import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from './components/AnimatedButton';
import { ConfigPanel } from './components/ConfigPanel';
import { ButtonAnimationConfig, ButtonState } from './types';
import { defaultConfig, presetTemplates } from './defaultConfig';
import { api } from './services/api';

export default function App() {
  const [config, setConfig] = useState<ButtonAnimationConfig>(defaultConfig);
  const [templates, setTemplates] = useState<ButtonAnimationConfig[]>([]);
  const [previewState, setPreviewState] = useState<ButtonState | undefined>();
  const [showTemplates, setShowTemplates] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const autoStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadTemplates();
    return () => {
      if (autoStateTimerRef.current) {
        clearTimeout(autoStateTimerRef.current);
      }
    };
  }, []);

  const loadTemplates = async () => {
    try {
      const saved = await api.getTemplates();
      if (saved.length > 0) {
        setTemplates(saved);
      } else {
        setTemplates(presetTemplates);
      }
    } catch {
      setTemplates(presetTemplates);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveTemplate = async () => {
    try {
      const saved = await api.createTemplate(config);
      setTemplates(prev => [saved, ...prev]);
      showNotification('模板保存成功！', 'success');
    } catch {
      showNotification('保存失败，请重试', 'error');
    }
  };

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      showNotification('模板删除成功！', 'success');
    } catch {
      showNotification('删除失败，请重试', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const data = await api.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `button-templates-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('导出成功！', 'success');
    } catch {
      showNotification('导出失败，请重试', 'error');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const imported = await api.bulkImport(data.templates || data);
        setTemplates(prev => [...imported, ...prev]);
        showNotification(`成功导入 ${imported.length} 个模板！`, 'success');
      } catch {
        showNotification('导入失败，请检查文件格式', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDemoState = (state: ButtonState) => {
    if (autoStateTimerRef.current) {
      clearTimeout(autoStateTimerRef.current);
      autoStateTimerRef.current = null;
    }
    
    setPreviewState(state);
    
    if (state === 'loading') {
      autoStateTimerRef.current = setTimeout(() => {
        setPreviewState(Math.random() > 0.5 ? 'success' : 'error');
        autoStateTimerRef.current = setTimeout(() => {
          setPreviewState(undefined);
        }, 2000);
      }, 2000);
    } else if (state === 'success' || state === 'error') {
      autoStateTimerRef.current = setTimeout(() => {
        setPreviewState(undefined);
      }, 2000);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '12px 24px',
              backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
              color: 'white',
              borderRadius: '8px',
              zIndex: 1000,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
            }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ width: '400px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>按钮动画工作室</h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>自定义您的完美按钮</p>
        </div>
        <ConfigPanel config={config} onChange={setConfig} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSaveTemplate}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              保存模板
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {showTemplates ? '隐藏模板' : '查看模板'} ({templates.length})
            </button>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ padding: '8px 16px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
              导入
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            <button
              onClick={handleExport}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              导出
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ borderBottom: '1px solid #e5e7eb', overflow: 'hidden' }}
            >
              <div style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      minWidth: '150px',
                      position: 'relative'
                    }}
                    onClick={() => setConfig(template)}
                    whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{template.name}</span>
                      {template.id && (
                        <button
                          onClick={(e) => handleDeleteTemplate(template.id!, e)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          删除
                        </button>
                      )}
                    </div>
                    <AnimatedButton config={template} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ backgroundColor: 'white', padding: '60px 80px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <AnimatedButton config={config} forceState={previewState} />
          </div>

          <div style={{ marginTop: '40px', display: 'flex', gap: '12px' }}>
            {(['idle', 'hover', 'active', 'loading', 'success', 'error'] as ButtonState[]).map((state) => {
              const isActive = previewState === state || (state === 'idle' && previewState === undefined);
              return (
                <button
                  key={state}
                  onClick={() => handleDemoState(state)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isActive ? '#6366f1' : 'white',
                    color: isActive ? 'white' : '#374151',
                    border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  {state === 'idle' ? '默认' : state === 'hover' ? '悬停' : state === 'active' ? '点击' : state === 'loading' ? '加载' : state === 'success' ? '成功' : '错误'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
