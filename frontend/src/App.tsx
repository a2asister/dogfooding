import React, { useState, useEffect, useCallback } from 'react';
import Ruler from './components/Ruler';
import Sidebar from './components/Sidebar';
import { MeasurementRecord, ScaleParams, SizeTemplate } from './types';
import { measurementApi, scaleParamsApi, sizeTemplateApi } from './services/api';
import './App.scss';

const App: React.FC = () => {
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [scaleParams, setScaleParams] = useState<ScaleParams[]>([
    { id: 0, name: '厘米 (默认)', unit: 'cm', pixelsPerUnit: 38 },
  ]);
  const [templates, setTemplates] = useState<SizeTemplate[]>([]);
  const [selectedScale, setSelectedScale] = useState<ScaleParams>(scaleParams[0]);
  const [lastMeasurement, setLastMeasurement] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const [m, s, t] = await Promise.all([
        measurementApi.getAll(),
        scaleParamsApi.getAll(),
        sizeTemplateApi.getAll(),
      ]);
      setMeasurements(m);
      if (s.length > 0) {
        setScaleParams(s);
        setSelectedScale(s[0]);
      }
      setTemplates(t);
    } catch (error) {
      console.log('使用默认数据');
    }
  };

  const handleMeasurement = useCallback((value: number): void => {
    setLastMeasurement(value);
  }, []);

  const handleAddMeasurement = async (label: string): Promise<void> => {
    if (lastMeasurement === null) return;
    try {
      const newRecord = await measurementApi.create({
        value: lastMeasurement,
        unit: selectedScale.unit,
        label,
      });
      setMeasurements((prev) => [newRecord, ...prev]);
      setLastMeasurement(null);
    } catch (error) {
      const newRecord: MeasurementRecord = {
        id: Date.now(),
        value: lastMeasurement,
        unit: selectedScale.unit,
        label,
        createdAt: new Date().toISOString(),
      };
      setMeasurements((prev) => [newRecord, ...prev]);
      setLastMeasurement(null);
    }
  };

  const handleDeleteMeasurement = async (id: number): Promise<void> => {
    try {
      await measurementApi.delete(id);
    } catch (error) {
      console.log('删除失败，本地更新');
    }
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddScale = async (data: Omit<ScaleParams, 'id'>): Promise<void> => {
    try {
      const newScale = await scaleParamsApi.create(data);
      setScaleParams((prev) => [...prev, newScale]);
    } catch (error) {
      const newScale: ScaleParams = { ...data, id: Date.now() };
      setScaleParams((prev) => [...prev, newScale]);
    }
  };

  const handleAddTemplate = async (data: Omit<SizeTemplate, 'id'>): Promise<void> => {
    try {
      const newTemplate = await sizeTemplateApi.create(data);
      setTemplates((prev) => [...prev, newTemplate]);
    } catch (error) {
      const newTemplate: SizeTemplate = { ...data, id: Date.now() };
      setTemplates((prev) => [...prev, newTemplate]);
    }
  };

  return (
    <div className="app">
      <Sidebar
        measurements={measurements}
        scaleParams={scaleParams}
        templates={templates}
        selectedScale={selectedScale}
        onSelectScale={setSelectedScale}
        onAddMeasurement={handleAddMeasurement}
        onDeleteMeasurement={handleDeleteMeasurement}
        onAddScale={handleAddScale}
        onAddTemplate={handleAddTemplate}
      />
      <main className="main-content">
        <div className="ruler-wrapper">
          <div className="ruler-header">
            <h2>动态测量尺</h2>
            <p className="scale-info">
              当前刻度: {selectedScale.name} · {selectedScale.pixelsPerUnit}px = 1{selectedScale.unit}
            </p>
          </div>
          <Ruler
            pixelsPerUnit={selectedScale.pixelsPerUnit}
            unit={selectedScale.unit}
            onMeasurement={handleMeasurement}
          />
          <div className="instructions">
            <div className="instruction-item">
              <span className="icon">🖱️</span>
              <span>水平滚动尺子查看更多刻度</span>
            </div>
            <div className="instruction-item">
              <span className="icon">📏</span>
              <span>拖拽鼠标进行测量，释放保存结果</span>
            </div>
            <div className="instruction-item">
              <span className="icon">💾</span>
              <span>在侧边栏添加标签保存测量记录</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
