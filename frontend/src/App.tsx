import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { Point, AnimationConfig, PathVersion, HistoryRecord, PathData } from './types';
import { generateId, generateSmoothPath } from './utils/pathUtils';

const defaultConfig: AnimationConfig = {
  duration: 0.5,
  ease: 'power2.out',
  loop: false,
  flowSpeed: 1,
  snapDistance: 20,
};

const initialPoints: Point[] = [
  { id: generateId(), x: 100, y: 200 },
  { id: generateId(), x: 250, y: 100 },
  { id: generateId(), x: 400, y: 300 },
  { id: generateId(), x: 550, y: 150 },
];

function App() {
  const [points, setPoints] = useState<Point[]>(initialPoints);
  const [config, setConfig] = useState<AnimationConfig>(defaultConfig);
  const [versions, setVersions] = useState<PathVersion[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [currentPath, setCurrentPath] = useState<PathData>({
    id: generateId(),
    name: '新建路径',
    points: initialPoints,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const handlePointsChange = useCallback((newPoints: Point[]) => {
    const action = newPoints.length > points.length ? '添加点' : newPoints.length < points.length ? '删除点' : '移动点';
    
    setHistory((prev) => [
      {
        id: generateId(),
        pathId: currentPath.id,
        action,
        beforeData: { ...currentPath, points },
        afterData: { ...currentPath, points: newPoints },
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    setPoints(newPoints);
    setCurrentPath((prev) => ({ ...prev, points: newPoints, updatedAt: Date.now() }));
  }, [points, currentPath]);

  const handleSaveVersion = useCallback((description: string) => {
    const newVersion: PathVersion = {
      id: generateId(),
      pathId: currentPath.id,
      versionNumber: versions.length + 1,
      data: { ...currentPath, points },
      createdAt: Date.now(),
      description,
    };
    setVersions((prev) => [...prev, newVersion]);
  }, [currentPath, points, versions]);

  const handleRestoreVersion = useCallback((versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (version) {
      setPoints(version.data.points);
      setCurrentPath({ ...version.data, updatedAt: Date.now() });
      
      setHistory((prev) => [
        {
          id: generateId(),
          pathId: currentPath.id,
          action: `恢复版本 v${version.versionNumber}`,
          beforeData: { ...currentPath, points },
          afterData: version.data,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    }
  }, [versions, currentPath, points]);

  const handleExportJSON = useCallback(() => {
    const data = JSON.stringify({ path: currentPath, points, config }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `path-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentPath, points, config]);

  const handleExportSVG = useCallback(() => {
    const pathData = generateSmoothPath(points);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <path d="${pathData}" fill="none" stroke="#4ecdc4" stroke-width="3"/>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `path-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [points]);

  const handleClearPoints = useCallback(() => {
    setHistory((prev) => [
      {
        id: generateId(),
        pathId: currentPath.id,
        action: '清空所有点',
        beforeData: { ...currentPath, points },
        afterData: { ...currentPath, points: [] },
        timestamp: Date.now(),
      },
      ...prev,
    ]);
    setPoints([]);
    setCurrentPath((prev) => ({ ...prev, points: [], updatedAt: Date.now() }));
  }, [currentPath, points]);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-white">可视化路径编辑器</h1>
        <p className="text-slate-400 text-sm mt-1">点击画布添加控制点，拖拽调整位置，双击删除点</p>
      </header>

      <div className="flex gap-4">
        <div className="flex-1">
          <Canvas points={points} onPointsChange={handlePointsChange} config={config} />
        </div>
        <ControlPanel
          config={config}
          onConfigChange={setConfig}
          versions={versions}
          history={history}
          onSaveVersion={handleSaveVersion}
          onRestoreVersion={handleRestoreVersion}
          onExportJSON={handleExportJSON}
          onExportSVG={handleExportSVG}
          onClearPoints={handleClearPoints}
          pointCount={points.length}
        />
      </div>

      <footer className="mt-4 text-center text-slate-500 text-xs">
        <p>技术栈: React + TypeScript + GSAP + Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;