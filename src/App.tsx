import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import Header from './components/Header';
import FarmView from './components/FarmView';
import BottomNav from './components/BottomNav';
import Warehouse from './components/Warehouse';
import Friends from './components/Friends';
import Shop from './components/Shop';
import Tasks from './components/Tasks';
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
        {activeTab === 'friends' && <Friends />}
        {activeTab === 'shop' && <Shop />}
        {activeTab === 'tasks' && <Tasks />}
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
