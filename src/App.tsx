import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import Header from './components/Header';
import FarmView from './components/FarmView';
import BottomNav from './components/BottomNav';
import Warehouse from './components/Warehouse';
import './styles/global.css';
import './App.css';

type TabType = 'farm' | 'warehouse' | 'friends' | 'shop' | 'tasks';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('farm');
  const [showWarehouse, setShowWarehouse] = useState(false);
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'warehouse') {
      setShowWarehouse(true);
    }
  };
  
  const handleCloseWarehouse = () => {
    setShowWarehouse(false);
    setActiveTab('farm');
  };
  
  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        {activeTab === 'farm' && <FarmView />}
        
        {activeTab === 'friends' && (
          <div className="placeholder-content">
            <span className="placeholder-icon">👥</span>
            <h2>好友系统</h2>
            <p>功能开发中...</p>
          </div>
        )}
        
        {activeTab === 'shop' && (
          <div className="placeholder-content">
            <span className="placeholder-icon">🛒</span>
            <h2>道具商城</h2>
            <p>功能开发中...</p>
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div className="placeholder-content">
            <span className="placeholder-icon">📋</span>
            <h2>任务中心</h2>
            <p>功能开发中...</p>
          </div>
        )}
      </main>
      
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      
      {showWarehouse && <Warehouse onClose={handleCloseWarehouse} />}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
