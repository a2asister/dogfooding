import { SpreadsheetProvider } from './context/SpreadsheetContext';
import { Toolbar } from './components/Toolbar';
import { SpreadsheetTable } from './components/SpreadsheetTable';
import './App.css';

function App() {
  return (
    <SpreadsheetProvider>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">
            <span className="logo-icon">📊</span>
            在线表格编辑系统
          </h1>
        </header>
        <Toolbar />
        <main className="app-main">
          <SpreadsheetTable />
        </main>
        <footer className="app-footer">
          <div className="footer-left">
            <span className="status-indicator ready">
              <span className="status-dot"></span>
              数据已保存
            </span>
          </div>
          <div className="footer-right">
            <span className="shortcut-hint">快捷键: Ctrl+S 保存 | Ctrl+Z 撤销 | Ctrl+Y 重做</span>
          </div>
        </footer>
      </div>
    </SpreadsheetProvider>
  );
}

export default App;
