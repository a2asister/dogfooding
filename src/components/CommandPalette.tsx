import { Search, File, Folder, Settings, Terminal, Copy, Scissors, Clipboard, Undo, Redo } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useProjectStore } from '../store/useProjectStore';
import { useState, useEffect, useRef } from 'react';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: any;
  shortcut?: string;
  handler: () => void;
}

export const CommandPalette = () => {
  const isCommandPaletteOpen = useUIStore((state) => state.isCommandPaletteOpen);
  const toggleCommandPalette = useUIStore((state) => state.toggleCommandPalette);
  const setActivityBarView = useUIStore((state) => state.setActivityBarView);
  const toggleBottomPanel = useUIStore((state) => state.toggleBottomPanel);
  
  const resetProject = useProjectStore((state) => state.resetProject);
  const createProject = useProjectStore((state) => state.createProject);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, toggleCommandPalette]);

  const commands: Command[] = [
    {
      id: 'files',
      label: '显示资源管理器',
      icon: Folder,
      shortcut: 'Ctrl+Shift+E',
      handler: () => setActivityBarView('files'),
    },
    {
      id: 'search',
      label: '显示搜索',
      icon: Search,
      shortcut: 'Ctrl+Shift+F',
      handler: () => setActivityBarView('search'),
    },
    {
      id: 'settings',
      label: '显示设置',
      icon: Settings,
      shortcut: 'Ctrl+,',
      handler: () => setActivityBarView('settings'),
    },
    {
      id: 'extensions',
      label: '显示依赖管理',
      icon: Settings,
      handler: () => setActivityBarView('extensions'),
    },
    {
      id: 'toggle-panel',
      label: '切换底部面板',
      icon: Terminal,
      shortcut: 'Ctrl+J',
      handler: () => toggleBottomPanel(),
    },
    {
      id: 'new-file',
      label: '新建文件',
      icon: File,
      shortcut: 'Ctrl+N',
      handler: () => {
        const name = prompt('输入文件名:');
        if (name) useProjectStore.getState().createFile(name);
      },
    },
    {
      id: 'new-folder',
      label: '新建文件夹',
      icon: Folder,
      handler: () => {
        const name = prompt('输入文件夹名:');
        if (name) useProjectStore.getState().createFolder(name);
      },
    },
    {
      id: 'reset-project',
      label: '重置项目',
      icon: File,
      handler: () => {
        if (window.confirm('确定要重置项目吗？')) resetProject();
      },
    },
    {
      id: 'react-project',
      label: '创建 React 项目',
      icon: File,
      handler: () => createProject('react'),
    },
    {
      id: 'vue-project',
      label: '创建 Vue 项目',
      icon: File,
      handler: () => createProject('vue'),
    },
    {
      id: 'vite-project',
      label: '创建 Vite 项目',
      icon: File,
      handler: () => createProject('vite'),
    },
    {
      id: 'vanilla-project',
      label: '创建 Vanilla 项目',
      icon: File,
      handler: () => createProject('vanilla'),
    },
    {
      id: 'format',
      label: '格式化代码',
      icon: Copy,
      shortcut: 'Shift+Alt+F',
      handler: () => {
        window.dispatchEvent(new CustomEvent('formatCode'));
      },
    },
    {
      id: 'copy',
      label: '复制',
      icon: Copy,
      shortcut: 'Ctrl+C',
      handler: () => document.execCommand('copy'),
    },
    {
      id: 'cut',
      label: '剪切',
      icon: Scissors,
      shortcut: 'Ctrl+X',
      handler: () => document.execCommand('cut'),
    },
    {
      id: 'paste',
      label: '粘贴',
      icon: Clipboard,
      shortcut: 'Ctrl+V',
      handler: () => document.execCommand('paste'),
    },
    {
      id: 'undo',
      label: '撤销',
      icon: Undo,
      shortcut: 'Ctrl+Z',
      handler: () => document.execCommand('undo'),
    },
    {
      id: 'redo',
      label: '重做',
      icon: Redo,
      shortcut: 'Ctrl+Y',
      handler: () => document.execCommand('redo'),
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cmd.description && cmd.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].handler();
        toggleCommandPalette();
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-24 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleCommandPalette();
      }}
    >
      <div className="w-full max-w-xl bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="输入命令..."
              className="flex-1 bg-transparent text-white outline-none text-sm placeholder-gray-500"
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              未找到匹配的命令
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.handler();
                  toggleCommandPalette();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-600 bg-opacity-20 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cmd.icon && <cmd.icon size={16} className="text-gray-400 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{cmd.label}</div>
                  {cmd.description && (
                    <div className="text-xs text-gray-500 truncate">{cmd.description}</div>
                  )}
                </div>
                {cmd.shortcut && (
                  <div className="flex gap-1 flex-shrink-0">
                    {cmd.shortcut.split('+').map((key, i) => (
                      <kbd
                        key={i}
                        className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-400 rounded border border-gray-600"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
        <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
          <span>↑↓ 选择, Enter 执行, Esc 关闭</span>
          <span>Ctrl+Shift+P 打开命令面板</span>
        </div>
      </div>
    </div>
  );
};
