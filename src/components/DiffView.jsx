import { useState } from 'react';

function DiffView({ differences, viewMode, leftCode, rightCode }) {
  const [mergedLines, setMergedLines] = useState([]);

  const formatDiffLines = () => {
    const leftLines = [];
    const rightLines = [];

    let leftLineNum = 1;
    let rightLineNum = 1;

    differences.forEach((part, index) => {
      const lines = part.value.split('\n');
      if (lines[lines.length - 1] === '') {
        lines.pop();
      }

      lines.forEach((line, lineIndex) => {
        const lineData = {
          content: line,
          type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
          id: `${index}-${lineIndex}`
        };

        if (part.added) {
          // 新增的行只显示在右侧
          leftLines.push({
            ...lineData,
            content: '',
            type: 'empty',
            lineNumber: null
          });
          rightLines.push({
            ...lineData,
            lineNumber: rightLineNum++
          });
        } else if (part.removed) {
          // 删除的行只显示在左侧
          leftLines.push({
            ...lineData,
            lineNumber: leftLineNum++
          });
          rightLines.push({
            ...lineData,
            content: '',
            type: 'empty',
            lineNumber: null
          });
        } else {
          // 未修改的行显示在两侧
          leftLines.push({
            ...lineData,
            lineNumber: leftLineNum++
          });
          rightLines.push({
            ...lineData,
            lineNumber: rightLineNum++
          });
        }
      });
    });

    return { leftLines, rightLines };
  };

  const { leftLines, rightLines } = formatDiffLines();

  const getLineClass = (type) => {
    switch (type) {
      case 'added':
        return 'diff-line-added';
      case 'removed':
        return 'diff-line-removed';
      case 'modified':
        return 'diff-line-modified';
      case 'empty':
        return 'bg-slate-800/50';
      default:
        return 'diff-line-unchanged';
    }
  };

  const getLinePrefix = (type) => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      default:
        return ' ';
    }
  };

  const handleMergeFromLeft = (index) => {
    // 简单的合并逻辑：将左侧行标记为已选中
    setMergedLines(prev => {
      const newLines = [...prev];
      newLines[index] = 'left';
      return newLines;
    });
  };

  const handleMergeFromRight = (index) => {
    // 简单的合并逻辑：将右侧行标记为已选中
    setMergedLines(prev => {
      const newLines = [...prev];
      newLines[index] = 'right';
      return newLines;
    });
  };

  if (viewMode === 'unified') {
    // 统一视图模式
    return (
      <div className="h-full overflow-auto">
        <div className="flex">
          {/* 行号列 */}
          <div className="bg-slate-800 border-r border-slate-700 py-2">
            <div className="text-xs font-medium text-slate-400 px-3 py-1 border-b border-slate-700 text-center">
              行号
            </div>
          </div>

          {/* 代码内容列 */}
          <div className="flex-1">
            <div className="text-xs font-medium text-slate-400 px-4 py-2 border-b border-slate-700 bg-slate-800">
              统一差异视图
            </div>
            <div className="code-editor">
              {leftLines.map((line, index) => {
                const isConflict = line.type !== 'unchanged' && line.type !== 'empty' &&
                                   rightLines[index] && rightLines[index].type !== 'unchanged' && rightLines[index].type !== 'empty';
                
                return (
                  <div
                    key={line.id}
                    className={`flex items-start ${getLineClass(line.type === 'empty' ? rightLines[index]?.type : line.type)} transition-colors`}
                  >
                    {/* 行号显示 */}
                    <div className="flex-shrink-0 flex border-r border-slate-700">
                      <div className="line-number text-xs py-0.5 w-12">
                        {line.lineNumber || ''}
                      </div>
                      <div className="line-number text-xs py-0.5 w-12">
                        {rightLines[index]?.lineNumber || ''}
                      </div>
                    </div>

                    {/* 前缀符号 */}
                    <div className="flex-shrink-0 w-6 text-center py-0.5 text-sm font-bold">
                      {line.type !== 'empty' ? getLinePrefix(line.type) : 
                       rightLines[index]?.type !== 'empty' ? getLinePrefix(rightLines[index].type) : ' '}
                    </div>

                    {/* 代码内容 */}
                    <div className="flex-1 py-0.5 px-2">
                      <pre className="whitespace-pre">
                        {line.type !== 'empty' ? line.content : rightLines[index]?.content || ''}
                      </pre>
                    </div>

                    {/* 合并按钮 */}
                    {isConflict && (
                      <div className="flex-shrink-0 flex items-center space-x-1 px-2">
                        <button
                          onClick={() => handleMergeFromLeft(index)}
                          className={`px-2 py-0.5 text-xs rounded transition-colors ${
                            mergedLines[index] === 'left'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                          title="使用左侧版本"
                        >
                          左
                        </button>
                        <button
                          onClick={() => handleMergeFromRight(index)}
                          className={`px-2 py-0.5 text-xs rounded transition-colors ${
                            mergedLines[index] === 'right'
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                          title="使用右侧版本"
                        >
                          右
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 双栏视图模式
  return (
    <div className="h-full overflow-auto">
      <div className="flex h-full">
        {/* 左侧代码栏 */}
        <div className="flex-1 border-r border-slate-700">
          <div className="text-xs font-medium text-slate-400 px-4 py-2 border-b border-slate-700 bg-slate-800 flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>左侧代码</span>
          </div>
          <div className="code-editor">
            {leftLines.map((line, index) => {
              const isConflict = line.type !== 'unchanged' && line.type !== 'empty' &&
                                 rightLines[index] && rightLines[index].type !== 'unchanged' && rightLines[index].type !== 'empty';
              
              return (
                <div
                  key={line.id}
                  className={`flex items-start ${getLineClass(line.type)} transition-colors group`}
                >
                  {/* 行号 */}
                  <div className="line-number text-xs py-0.5 flex-shrink-0">
                    {line.lineNumber || ''}
                  </div>

                  {/* 前缀符号 */}
                  <div className="flex-shrink-0 w-6 text-center py-0.5 text-sm font-bold">
                    {getLinePrefix(line.type)}
                  </div>

                  {/* 代码内容 */}
                  <div className="flex-1 py-0.5 px-2">
                    <pre className="whitespace-pre">
                      {line.content}
                    </pre>
                  </div>

                  {/* 合并按钮 */}
                  {isConflict && (
                    <div className="flex-shrink-0 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleMergeFromLeft(index)}
                        className={`px-2 py-0.5 text-xs rounded transition-colors ${
                          mergedLines[index] === 'left'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                        title="选择此行"
                      >
                        选择
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧代码栏 */}
        <div className="flex-1">
          <div className="text-xs font-medium text-slate-400 px-4 py-2 border-b border-slate-700 bg-slate-800 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>右侧代码</span>
          </div>
          <div className="code-editor">
            {rightLines.map((line, index) => {
              const isConflict = line.type !== 'unchanged' && line.type !== 'empty' &&
                                 leftLines[index] && leftLines[index].type !== 'unchanged' && leftLines[index].type !== 'empty';
              
              return (
                <div
                  key={line.id}
                  className={`flex items-start ${getLineClass(line.type)} transition-colors group`}
                >
                  {/* 行号 */}
                  <div className="line-number text-xs py-0.5 flex-shrink-0">
                    {line.lineNumber || ''}
                  </div>

                  {/* 前缀符号 */}
                  <div className="flex-shrink-0 w-6 text-center py-0.5 text-sm font-bold">
                    {getLinePrefix(line.type)}
                  </div>

                  {/* 代码内容 */}
                  <div className="flex-1 py-0.5 px-2">
                    <pre className="whitespace-pre">
                      {line.content}
                    </pre>
                  </div>

                  {/* 合并按钮 */}
                  {isConflict && (
                    <div className="flex-shrink-0 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleMergeFromRight(index)}
                        className={`px-2 py-0.5 text-xs rounded transition-colors ${
                          mergedLines[index] === 'right'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                        title="选择此行"
                      >
                        选择
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiffView;
