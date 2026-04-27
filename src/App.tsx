import { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Timeline } from './components/Timeline';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { CanvasVisualization } from './components/CanvasVisualization';
import './App.css';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const { loadState, saveState, state, selectNode } = useAppContext();
  const { selectedNodeId } = state;

  useEffect(() => {
    const updateSize = () => {
      const headerHeight = 60;
      const timelineHeight = 100;
      const availableWidth = window.innerWidth;
      const availableHeight = window.innerHeight - headerHeight - timelineHeight;

      setCanvasSize({
        width: availableWidth,
        height: Math.max(400, availableHeight),
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveState]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app">
      <Header onToggleSidebar={handleToggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="main-content">
        <Sidebar isOpen={sidebarOpen} onToggle={handleToggleSidebar} />

        <div className={`visualization-area ${sidebarOpen ? 'sidebar-open' : ''} ${selectedNodeId ? 'detail-open' : ''}`}>
          <CanvasVisualization width={canvasSize.width} height={canvasSize.height} />
        </div>

        <NodeDetailPanel
          isOpen={!!selectedNodeId}
          onClose={() => selectNode(null)}
        />
      </div>

      <Timeline />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
