import { Terminal, AlertCircle, Trash2, Play, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import type { BottomPanelView } from '../types';
import { useEffect, useRef, useState, useMemo } from 'react';

const TabButton = ({ 
  view, 
  currentView, 
  icon: Icon, 
  label,
  count 
}: { 
  view: BottomPanelView; 
  currentView: BottomPanelView;
  icon: any;
  label: string;
  count?: number;
}) => {
  const setView = useUIStore((state) => state.setBottomPanelView);
  
  return (
    <button
      onClick={() => setView(view)}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors border-b-2 ${
        currentView === view
          ? 'text-white border-blue-500'
          : 'text-gray-400 border-transparent hover:text-gray-300'
      }`}
    >
      <Icon size={14} />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="px-1.5 py-0.5 text-xs bg-gray-600 text-gray-300 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
};

const ConsolePanel = () => {
  const consoleLogs = useUIStore((state) => state.consoleLogs);
  const clearConsole = useUIStore((state) => state.clearConsole);
  const addConsoleLog = useUIStore((state) => state.addConsoleLog);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const captureLog = (type: 'log' | 'error' | 'warn' | 'info', args: any[]) => {
      const content = args.map((arg) => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      addConsoleLog({ type, content });
    };

    console.log = (...args) => { originalLog(...args); captureLog('log', args); };
    console.error = (...args) => { originalError(...args); captureLog('error', args); };
    console.warn = (...args) => { originalWarn(...args); captureLog('warn', args); };
    console.info = (...args) => { originalInfo(...args); captureLog('info', args); };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, [addConsoleLog]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return '✕';
      case 'warn': return '⚠';
      case 'info': return 'ℹ';
      default: return '›';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-700">
        <span className="text-xs text-gray-400">控制台输出</span>
        <button
          onClick={clearConsole}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
        >
          <Trash2 size={12} />
          清空
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-sm">
        {consoleLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            控制台暂无输出
          </div>
        ) : (
          consoleLogs.map((log) => (
            <div key={log.id} className={`flex items-start gap-2 py-1 ${getLogColor(log.type)}`}>
              <span className="flex-shrink-0">{getLogIcon(log.type)}</span>
              <pre className="flex-1 whitespace-pre-wrap break-words">{log.content}</pre>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProblemsPanel = () => {
  const problems = useUIStore((state) => state.problems);
  const clearProblems = useUIStore((state) => state.clearProblems);

  const getProblemColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getProblemIcon = (type: string) => {
    switch (type) {
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-700">
        <span className="text-xs text-gray-400">
          {problems.length} 个问题
        </span>
        <button
          onClick={clearProblems}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
        >
          <Trash2 size={12} />
          清除
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {problems.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            未检测到问题
          </div>
        ) : (
          problems.map((problem) => (
            <div
              key={problem.id}
              className={`flex items-start gap-2 py-2 px-2 rounded hover:bg-gray-700 cursor-pointer ${getProblemColor(
                problem.type
              )}`}
            >
              <span className="flex-shrink-0">{getProblemIcon(problem.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{problem.message}</div>
                <div className="text-xs text-gray-500">
                  {problem.file}:{problem.line}:{problem.column}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const TerminalPanel = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['$ WebCode IDE 终端模拟']);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    let output = '';

    if (command === '') return;
    
    switch (command) {
      case 'help':
        output = '可用命令: help, clear, ls, pwd, date, echo <text>';
        break;
      case 'clear':
        setHistory(['$ 终端已清空']);
        return;
      case 'ls':
        output = 'index.html  style.css  app.js';
        break;
      case 'pwd':
        output = '/home/webcode/project';
        break;
      case 'date':
        output = new Date().toLocaleString();
        break;
      default:
        if (command.startsWith('echo ')) {
          output = cmd.slice(5);
        } else {
          output = `命令未找到: ${cmd}`;
        }
    }

    setHistory((prev) => [...prev, `$ ${cmd}`, output]);
  };

  return (
    <div className="h-full flex flex-col font-mono">
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-700">
        <span className="text-xs text-gray-400">终端</span>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-gray-700 rounded text-gray-400">
            <Play size={12} />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded text-gray-400">
            <X size={12} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 text-sm text-gray-300">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-green-400">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCommand(input);
                setInput('');
              }
            }}
            className="flex-1 bg-transparent text-gray-300 outline-none text-sm"
            placeholder="输入命令..."
          />
        </div>
      </div>
    </div>
  );
};

const OutputPanel = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-700">
        <span className="text-xs text-gray-400">输出</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-gray-500 text-center">
          等待构建输出...
        </div>
      </div>
    </div>
  );
};

export const BottomPanel = () => {
  const isBottomPanelOpen = useUIStore((state) => state.isBottomPanelOpen);
  const toggleBottomPanel = useUIStore((state) => state.toggleBottomPanel);
  const bottomPanelView = useUIStore((state) => state.bottomPanelView);
  const consoleLogs = useUIStore((state) => state.consoleLogs);
  const problems = useUIStore((state) => state.problems);

  const renderContent = () => {
    switch (bottomPanelView) {
      case 'console':
        return <ConsolePanel />;
      case 'problems':
        return <ProblemsPanel />;
      case 'terminal':
        return <TerminalPanel />;
      case 'output':
        return <OutputPanel />;
      default:
        return <ConsolePanel />;
    }
  };

  return (
    <div className="border-t border-gray-700 bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-700">
        <div className="flex">
          <TabButton
            view="console"
            currentView={bottomPanelView}
            icon={Terminal}
            label="控制台"
            count={consoleLogs.length}
          />
          <TabButton
            view="problems"
            currentView={bottomPanelView}
            icon={AlertCircle}
            label="问题"
            count={problems.length}
          />
          <TabButton
            view="terminal"
            currentView={bottomPanelView}
            icon={Terminal}
            label="终端"
          />
          <TabButton
            view="output"
            currentView={bottomPanelView}
            icon={Terminal}
            label="输出"
          />
        </div>
        <button
          onClick={toggleBottomPanel}
          className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          {isBottomPanelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
      {isBottomPanelOpen && (
        <div className="h-48">{renderContent()}</div>
      )}
    </div>
  );
};
