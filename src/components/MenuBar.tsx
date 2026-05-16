import { useState, useRef, useEffect } from 'react';
import { File, Play, HelpCircle, Download, RotateCcw, Plus, FolderOpen, Edit, Eye, Terminal, Settings, Code, Copy, Scissors, Clipboard, Undo2, Redo2, Search, Command } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { useUIStore } from '../store/useUIStore';
import { exportProjectAsZip } from '../utils/zip';

interface MenuDropdownProps {
  title: string;
  icon: React.ReactNode;
  items: {
    label: string;
    shortcut?: string;
    onClick: () => void;
    disabled?: boolean;
    divider?: boolean;
  }[];
}

const MenuDropdown = ({ title, icon, items }: MenuDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: MenuDropdownProps['items'][0]) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors ${
          isOpen ? 'bg-gray-700' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        <span>{title}</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 py-1">
          {items.map((item, index) => (
            item.divider ? (
              <div key={index} className="border-t border-gray-700 my-1" />
            ) : (
              <button
                key={index}
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors flex items-center justify-between ${
                  item.disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300'
                }`}
                onClick={() => handleItemClick(item)}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-gray-500">{item.shortcut}</span>
                )}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export const MenuBar = () => {
  const resetProject = useProjectStore((state) => state.resetProject);
  const createFile = useProjectStore((state) => state.createFile);
  const createFolder = useProjectStore((state) => state.createFolder);
  const files = useProjectStore((state) => state.files);
  
  const toggleCommandPalette = useUIStore((state) => state.toggleCommandPalette);
  const toggleBottomPanel = useUIStore((state) => state.toggleBottomPanel);
  const setActivityBarView = useUIStore((state) => state.setActivityBarView);
  const toggleCreateProject = useUIStore((state) => state.toggleCreateProject);

  return (
    <div className="h-9 bg-gray-900 border-b border-gray-700 flex items-center px-2 gap-0.5">
      <MenuDropdown
        title="文件"
        icon={<File size={14} />}
        items={[
          {
            label: '新建文件',
            shortcut: 'Ctrl+N',
            onClick: () => {
              const name = prompt('输入文件名:');
              if (name) createFile(name);
            },
          },
          {
            label: '新建文件夹',
            onClick: () => {
              const name = prompt('输入文件夹名:');
              if (name) createFolder(name);
            },
          },
          {
            label: '从模板创建',
            onClick: toggleCreateProject,
            divider: true,
          },
          {
            label: '下载 ZIP',
            shortcut: 'Ctrl+Shift+S',
            onClick: () => exportProjectAsZip(files),
          },
          {
            label: '重置项目',
            onClick: () => {
              if (window.confirm('确定要重置项目吗？所有更改将丢失。')) {
                resetProject();
              }
            },
            divider: true,
          },
        ]}
      />

      <MenuDropdown
        title="编辑"
        icon={<Edit size={14} />}
        items={[
          {
            label: '撤销',
            shortcut: 'Ctrl+Z',
            onClick: () => document.execCommand('undo'),
          },
          {
            label: '重做',
            shortcut: 'Ctrl+Y',
            onClick: () => document.execCommand('redo'),
          },
          {
            label: '剪切',
            shortcut: 'Ctrl+X',
            onClick: () => document.execCommand('cut'),
            divider: true,
          },
          {
            label: '复制',
            shortcut: 'Ctrl+C',
            onClick: () => document.execCommand('copy'),
          },
          {
            label: '粘贴',
            shortcut: 'Ctrl+V',
            onClick: () => document.execCommand('paste'),
            divider: true,
          },
          {
            label: '格式化代码',
            shortcut: 'Shift+Alt+F',
            onClick: () => window.dispatchEvent(new CustomEvent('formatCode')),
          },
        ]}
      />

      <MenuDropdown
        title="查看"
        icon={<Eye size={14} />}
        items={[
          {
            label: '命令面板',
            shortcut: 'Ctrl+Shift+P',
            onClick: toggleCommandPalette,
          },
          {
            label: '资源管理器',
            shortcut: 'Ctrl+Shift+E',
            onClick: () => setActivityBarView('files'),
          },
          {
            label: '搜索',
            shortcut: 'Ctrl+Shift+F',
            onClick: () => setActivityBarView('search'),
          },
          {
            label: '依赖管理',
            onClick: () => setActivityBarView('extensions'),
            divider: true,
          },
          {
            label: '切换底部面板',
            shortcut: 'Ctrl+J',
            onClick: toggleBottomPanel,
          },
          {
            label: '设置',
            shortcut: 'Ctrl+,',
            onClick: () => setActivityBarView('settings'),
          },
        ]}
      />

      <MenuDropdown
        title="运行"
        icon={<Play size={14} />}
        items={[
          {
            label: '刷新预览',
            shortcut: 'Ctrl+R',
            onClick: () => window.dispatchEvent(new CustomEvent('refreshPreview')),
          },
        ]}
      />

      <MenuDropdown
        title="终端"
        icon={<Terminal size={14} />}
        items={[
          {
            label: '新建终端',
            shortcut: 'Ctrl+`',
            onClick: () => {
              toggleBottomPanel();
              useUIStore.getState().setBottomPanelView('terminal');
            },
          },
          {
            label: '运行任务',
            onClick: () => {},
            disabled: true,
          },
        ]}
      />

      <MenuDropdown
        title="帮助"
        icon={<HelpCircle size={14} />}
        items={[
          {
            label: '键盘快捷键',
            shortcut: 'Ctrl+K Ctrl+S',
            onClick: () => alert('常用快捷键:\nCtrl+Shift+P: 命令面板\nCtrl+Shift+E: 资源管理器\nCtrl+Shift+F: 搜索\nCtrl+J: 切换面板\nCtrl+S: 保存\nCtrl+Z: 撤销\nCtrl+Y: 重做\nShift+Alt+F: 格式化'),
          },
          {
            label: '关于 WebCode IDE',
            onClick: () => alert('WebCode IDE v2.0\n一个功能完整的在线代码编辑器'),
          },
        ]}
      />

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={toggleCommandPalette}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="命令面板 (Ctrl+Shift+P)"
        >
          <Command size={14} />
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('refreshPreview'))}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="刷新预览"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="text-xs text-gray-500 px-3 border-l border-gray-700">
        WebCode IDE v2.0
      </div>
    </div>
  );
};
