import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeasurementRecord, ScaleParams, SizeTemplate } from '../types';
import './Sidebar.scss';

interface SidebarProps {
  measurements: MeasurementRecord[];
  scaleParams: ScaleParams[];
  templates: SizeTemplate[];
  selectedScale: ScaleParams;
  onSelectScale: (scale: ScaleParams) => void;
  onAddMeasurement: (label: string) => void;
  onDeleteMeasurement: (id: number) => void;
  onAddScale: (data: Omit<ScaleParams, 'id'>) => void;
  onAddTemplate: (data: Omit<SizeTemplate, 'id'>) => void;
}

type TabType = 'measurements' | 'scales' | 'templates';

const Sidebar: React.FC<SidebarProps> = ({
  measurements,
  scaleParams,
  templates,
  selectedScale,
  onSelectScale,
  onAddMeasurement,
  onDeleteMeasurement,
  onAddScale,
  onAddTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('measurements');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newScale, setNewScale] = useState({ name: '', unit: '', pixelsPerUnit: 10 });
  const [newTemplate, setNewTemplate] = useState({ name: '', width: 0, height: 0, unit: 'cm' });

  const handleSubmit = (): void => {
    if (activeTab === 'measurements' && newLabel.trim()) {
      onAddMeasurement(newLabel);
      setNewLabel('');
    } else if (activeTab === 'scales' && newScale.name && newScale.unit) {
      onAddScale(newScale);
      setNewScale({ name: '', unit: '', pixelsPerUnit: 10 });
    } else if (activeTab === 'templates' && newTemplate.name) {
      onAddTemplate(newTemplate);
      setNewTemplate({ name: '', width: 0, height: 0, unit: 'cm' });
    }
    setShowAddForm(false);
  };

  const tabs = [
    { id: 'measurements' as TabType, label: '测量记录', icon: '📏' },
    { id: 'scales' as TabType, label: '刻度参数', icon: '⚙️' },
    { id: 'templates' as TabType, label: '尺寸模板', icon: '📐' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>便携尺子</h1>
        <p className="subtitle">精准测量工具</p>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="content-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="tab-content"
          >
            {activeTab === 'measurements' && (
              <div className="measurements-list">
                {measurements.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📝</span>
                    <p>暂无测量记录</p>
                    <span className="empty-hint">拖拽尺子开始测量</span>
                  </div>
                ) : (
                  measurements.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="measurement-item"
                    >
                      <div className="measurement-info">
                        <span className="measurement-name">{item.label}</span>
                        <span className="measurement-result">
                          {item.value} {item.unit}
                        </span>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => onDeleteMeasurement(item.id)}
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'scales' && (
              <div className="scales-list">
                {scaleParams.map((scale) => (
                  <motion.div
                    key={scale.id}
                    layout
                    onClick={() => onSelectScale(scale)}
                    className={`scale-item ${selectedScale.id === scale.id ? 'active' : ''}`}
                  >
                    <div className="scale-info">
                      <span className="scale-name">{scale.name}</span>
                      <span className="scale-detail">
                        {scale.pixelsPerUnit}px = 1{scale.unit}
                      </span>
                    </div>
                    {selectedScale.id === scale.id && (
                      <div className="active-indicator">✓</div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="templates-list">
                {templates.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📐</span>
                    <p>暂无尺寸模板</p>
                    <span className="empty-hint">添加常用尺寸快速访问</span>
                  </div>
                ) : (
                  templates.map((template) => (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="template-item"
                    >
                      <span className="template-name">{template.name}</span>
                      <span className="template-size">
                        {template.width} × {template.height} {template.unit}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        className="add-btn"
        onClick={() => setShowAddForm(true)}
      >
        <span className="add-icon">+</span>
        <span>添加</span>
      </button>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>
                {activeTab === 'measurements' && '保存测量结果'}
                {activeTab === 'scales' && '添加刻度参数'}
                {activeTab === 'templates' && '添加尺寸模板'}
              </h3>

              {activeTab === 'measurements' && (
                <input
                  type="text"
                  placeholder="输入标签名称"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="form-input"
                />
              )}

              {activeTab === 'scales' && (
                <>
                  <input
                    type="text"
                    placeholder="参数名称"
                    value={newScale.name}
                    onChange={(e) => setNewScale({ ...newScale, name: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="text"
                    placeholder="单位 (如: cm, mm)"
                    value={newScale.unit}
                    onChange={(e) => setNewScale({ ...newScale, unit: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="number"
                    placeholder="每单位像素数"
                    value={newScale.pixelsPerUnit}
                    onChange={(e) => setNewScale({ ...newScale, pixelsPerUnit: Number(e.target.value) })}
                    className="form-input"
                  />
                </>
              )}

              {activeTab === 'templates' && (
                <>
                  <input
                    type="text"
                    placeholder="模板名称"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="form-input"
                  />
                  <div className="size-inputs">
                    <input
                      type="number"
                      placeholder="宽度"
                      value={newTemplate.width || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, width: Number(e.target.value) })}
                      className="form-input"
                    />
                    <span className="separator">×</span>
                    <input
                      type="number"
                      placeholder="高度"
                      value={newTemplate.height || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, height: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="单位"
                    value={newTemplate.unit}
                    onChange={(e) => setNewTemplate({ ...newTemplate, unit: e.target.value })}
                    className="form-input"
                  />
                </>
              )}

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  取消
                </button>
                <button
                  className="confirm-btn"
                  onClick={handleSubmit}
                >
                  确认
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;
