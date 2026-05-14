import { useState, useEffect } from 'react';

interface ColorPalette {
  id: number;
  name: string;
  colors: string[];
  createdAt: string;
}

interface ExportRecordItem {
  id: number;
  filename: string;
  colors: string[];
  createdAt: string;
}

interface ColorPaletteManagerProps {
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
  exportRefreshKey?: number;
}

export default function ColorPaletteManager({ selectedColors, onColorsChange, exportRefreshKey }: ColorPaletteManagerProps) {
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [exportRecords, setExportRecords] = useState<ExportRecordItem[]>([]);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [activeTab, setActiveTab] = useState<'palette' | 'history' | 'library'>('palette');

  useEffect(() => {
    fetchPalettes();
    fetchExportRecords();
  }, []);

  useEffect(() => {
    if (exportRefreshKey !== undefined && exportRefreshKey > 0) {
      fetchExportRecords();
    }
  }, [exportRefreshKey]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchExportRecords();
    }
  }, [activeTab]);

  const fetchPalettes = async () => {
    try {
      const response = await fetch('http://localhost:7890/api/palettes');
      const data = await response.json();
      setPalettes(data);
    } catch (error) {
      console.error('Failed to fetch palettes:', error);
    }
  };

  const fetchExportRecords = async () => {
    try {
      const response = await fetch('http://localhost:7890/api/exports');
      const data = await response.json();
      setExportRecords(data);
    } catch (error) {
      console.error('Failed to fetch export records:', error);
    }
  };

  const savePalette = async () => {
    if (!newPaletteName.trim()) return;
    
    try {
      const response = await fetch('http://localhost:7890/api/palettes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPaletteName,
          colors: selectedColors
        })
      });
      
      if (response.ok) {
        setNewPaletteName('');
        fetchPalettes();
      }
    } catch (error) {
      console.error('Failed to save palette:', error);
    }
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...selectedColors];
    newColors[index] = color;
    onColorsChange(newColors);
  };

  const addColor = () => {
    if (selectedColors.length < 12) {
      onColorsChange([...selectedColors, '#ffffff']);
    }
  };

  const removeColor = (index: number) => {
    if (selectedColors.length > 2) {
      onColorsChange(selectedColors.filter((_, i) => i !== index));
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '20px',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['palette', 'history', 'library'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === tab ? '#4ecdc4' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            {tab === 'palette' ? '🎨 调色板' : tab === 'history' ? '📜 记录' : '📚 库'}
          </button>
        ))}
      </div>

      {activeTab === 'palette' && (
        <>
          <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>手动拖拽调色</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '12px',
            marginBottom: '15px'
          }}>
            {selectedColors.map((color, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '8px',
                  background: color,
                  boxShadow: `0 4px 15px ${color}40`
                }} />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(index, e.target.value)}
                  style={{
                    width: '100%',
                    height: '30px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: 'transparent'
                  }}
                />
                <button
                  onClick={() => removeColor(index)}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    borderRadius: '6px',
                    background: 'rgba(255, 107, 107, 0.3)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  移除
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addColor}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            + 添加颜色
          </button>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '15px'
          }}>
            <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>保存配色方案</h4>
            <input
              type="text"
              value={newPaletteName}
              onChange={(e) => setNewPaletteName(e.target.value)}
              placeholder="输入方案名称..."
              style={{
                width: '100%',
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                marginBottom: '10px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={savePalette}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(90deg, #4ecdc4, #45b7d1)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              💾 保存配色
            </button>
          </div>
        </>
      )}

      {activeTab === 'library' && (
        <div>
          <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>我的配色库</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {palettes.map((palette) => (
              <div key={palette.id} style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>{palette.name}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>
                    {new Date(palette.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {palette.colors.map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: '25px',
                        height: '25px',
                        borderRadius: '4px',
                        background: color
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
            {palettes.length === 0 && (
              <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>
                暂无配色方案
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>导出记录</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {exportRecords.map((record) => (
              <div key={record.id} style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  fontSize: '12px'
                }}>
                  <span style={{ fontWeight: '600', wordBreak: 'break-all' }}>{record.filename}</span>
                  <span style={{ opacity: 0.6 }}>
                    {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {record.colors.map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: color
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
            {exportRecords.length === 0 && (
              <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>
                暂无导出记录
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
