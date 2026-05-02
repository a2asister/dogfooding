import { useState, useMemo } from 'react';
import * as diff from 'diff';
import CodeEditor from './CodeEditor';
import DiffView from './DiffView';

function CodeDiffViewer({ leftCode, rightCode, onLeftCodeChange, onRightCodeChange, onMergeComplete }) {
  const [viewMode, setViewMode] = useState('split'); // split, unified, edit
  const [mergedCode, setMergedCode] = useState('');
  const [showMergeResult, setShowMergeResult] = useState(false);

  const differences = useMemo(() => {
    return diff.diffLines(leftCode, rightCode);
  }, [leftCode, rightCode]);

  const handleMerge = () => {
    const result = rightCode;
    setMergedCode(result);
    setShowMergeResult(true);
    onMergeComplete(result);
  };

  const handleSwap = () => {
    const temp = leftCode;
    onLeftCodeChange(rightCode);
    onRightCodeChange(temp);
  };

  const handleCopyMerged = () => {
    navigator.clipboard.writeText(mergedCode);
    alert('已复制到剪贴板！');
  };

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="bg-slate-800 rounded-t-lg border border-slate-700 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'edit'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            编辑模式
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            双栏对比
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'unified'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            统一对比
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSwap}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>交换</span>
          </button>
          <button
            onClick={handleMerge}
            className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>合并</span>
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 border border-slate-700 border-t-0 rounded-b-lg overflow-hidden">
        {viewMode === 'edit' && (
          <div className="flex flex-col lg:flex-row h-full">
            <div className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-700">
              <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>左侧代码 (原始版本)</span>
                </span>
              </div>
              <CodeEditor
                value={leftCode}
                onChange={onLeftCodeChange}
                placeholder="在此输入左侧代码..."
              />
            </div>
            <div className="flex-1">
              <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>右侧代码 (修改版本)</span>
                </span>
              </div>
              <CodeEditor
                value={rightCode}
                onChange={onRightCodeChange}
                placeholder="在此输入右侧代码..."
              />
            </div>
          </div>
        )}

        {(viewMode === 'split' || viewMode === 'unified') && (
          <DiffView
            differences={differences}
            viewMode={viewMode}
            leftCode={leftCode}
            rightCode={rightCode}
          />
        )}
      </div>

      {/* 合并结果显示 */}
      {showMergeResult && (
        <div className="mt-4 border border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300 flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span>合并结果</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyMerged}
                className="px-3 py-1 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded text-xs font-medium transition-colors"
              >
                复制
              </button>
              <button
                onClick={() => setShowMergeResult(false)}
                className="px-3 py-1 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded text-xs font-medium transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
          <div className="p-4 bg-slate-900 max-h-64 overflow-auto">
            <pre className="code-editor whitespace-pre-wrap">{mergedCode}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeDiffViewer;
