import { useState, useCallback } from 'react';
import GradientArtCanvas from './GradientArtCanvas';
import ColorPaletteManager from './ColorPaletteManager';

export default function ArtCreator() {
  const [selectedColors, setSelectedColors] = useState<string[]>([
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'
  ]);
  const [exportRefreshKey, setExportRefreshKey] = useState(0);

  const handleExportSuccess = useCallback(() => {
    setExportRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="main-content">
      <div className="canvas-wrapper">
        <GradientArtCanvas 
          selectedColors={selectedColors}
          onExportSuccess={handleExportSuccess}
        />
      </div>
      <div className="sidebar">
        <ColorPaletteManager 
          selectedColors={selectedColors}
          onColorsChange={setSelectedColors}
          exportRefreshKey={exportRefreshKey}
        />
      </div>
    </div>
  );
}
