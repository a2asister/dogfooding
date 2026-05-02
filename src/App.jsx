import { useState } from 'react';
import CodeDiffViewer from './components/CodeDiffViewer';
import VersionHistory from './components/VersionHistory';
import { initialLeftCode, initialRightCode } from './utils/sampleCode';

function App() {
  const [leftCode, setLeftCode] = useState(initialLeftCode);
  const [rightCode, setRightCode] = useState(initialRightCode);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const handleSaveVersion = () => {
    const newVersion = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      leftCode: leftCode,
      rightCode: rightCode,
      mergedCode: null
    };
    setVersions([newVersion, ...versions]);
  };

  const handleLoadVersion = (version) => {
    setSelectedVersion(version);
    setLeftCode(version.leftCode);
    setRightCode(version.rightCode);
  };

  const handleMergeComplete = (mergedCode) => {
    const newVersion = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      leftCode: leftCode,
      rightCode: rightCode,
      mergedCode: mergedCode
    };
    setVersions([newVersion, ...versions]);
    alert('合并完成，已保存到版本历史！');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* 头部导航栏 */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 shadow-lg">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">代码对比合并工具</h1>
          </div>
          <button
            onClick={handleSaveVersion}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>保存版本</span>
          </button>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 左侧主区域 */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <CodeDiffViewer
            leftCode={leftCode}
            rightCode={rightCode}
            onLeftCodeChange={setLeftCode}
            onRightCodeChange={setRightCode}
            onMergeComplete={handleMergeComplete}
          />
        </div>

        {/* 右侧版本历史面板 */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-700 bg-slate-800">
          <VersionHistory
            versions={versions}
            selectedVersion={selectedVersion}
            onLoadVersion={handleLoadVersion}
          />
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="bg-slate-800 border-t border-slate-700 px-6 py-2 text-sm text-slate-400">
        <div className="flex items-center justify-between">
          <span>代码对比合并工具 - 支持双栏对比、差异高亮、逐行合并、版本回溯</span>
          <span className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>就绪</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
