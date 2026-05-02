import { useState } from 'react';

function VersionHistory({ versions, selectedVersion, onLoadVersion }) {
  const [expandedVersion, setExpandedVersion] = useState(null);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const toggleExpand = (versionId) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 面板标题 */}
      <div className="bg-slate-700/50 px-4 py-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>版本历史</span>
        </h3>
      </div>

      {/* 版本列表 */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <p className="text-slate-400 text-sm mb-2">暂无版本记录</p>
            <p className="text-slate-500 text-xs">点击"保存版本"按钮创建版本历史</p>
          </div>
        ) : (
            <div className="space-y-2 p-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    selectedVersion?.id === version.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* 版本头部 */}
                  <div
                    className="px-3 py-2 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(version.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        version.mergedCode ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="text-xs font-medium text-slate-300">
                          版本 {versions.length - index}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatTimestamp(version.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {version.mergedCode && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                          已合并
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          expandedVersion === version.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* 展开的详情 */}
                  {expandedVersion === version.id && (
                    <div className="px-3 pb-3 border-t border-slate-700">
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>左侧代码行数: {version.leftCode.split('\n').length}</span>
                          </span>
                          <span className="text-slate-400 flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>右侧代码行数: {version.rightCode.split('\n').length}</span>
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoadVersion(version);
                          }}
                          className="w-full mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors flex items-center justify-center space-x-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582-7m-4.582 7a8.001 8.001 0 01-15.356-2m0 0l.725-1.45M4.582 9h5.418" />
                          </svg>
                          <span>加载此版本</span>
                        </button>

                        {version.mergedCode && (
                          <div className="mt-2 pt-2 border-t border-slate-700">
                            <p className="text-xs text-slate-400 mb-1 flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>合并结果 ({version.mergedCode.split('\n').length} 行)</span>
                            </p>
                            <div className="bg-slate-900 rounded p-2 max-h-32 overflow-auto">
                              <pre className="text-xs text-slate-400 whitespace-pre">
                                {version.mergedCode.substring(0, 500)}{version.mergedCode.length > 500 ? '...' : ''}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>

      {/* 底部提示 */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2">
        <p className="text-xs text-slate-500 text-center">
          已保存 {versions.length} 个版本
        </p>
      </div>
    </div>
  );
}

export default VersionHistory;
