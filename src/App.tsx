import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SidebarNav } from './components/SidebarNav';
import { MainPage } from './pages/MainPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { QuizPage } from './pages/QuizPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-cream flex">
        <SidebarNav />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <div className="md:hidden">
            <Header />
          </div>
          
          <main className="flex-1 px-6 md:px-12 lg:px-20 py-8 md:py-12 max-w-6xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/knowledge" element={<KnowledgePage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          
          <BottomNav />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
