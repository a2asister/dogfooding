import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Toolbar />
        <main className="flex-1 overflow-auto scrollbar-hide bg-gray-100 p-4">
          <Canvas />
        </main>
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default App;
