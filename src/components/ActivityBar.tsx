import { Files, Search, Settings, Package, ChevronRight, ChevronDown, File, Folder, Plus, Trash2, Pencil } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useProjectStore } from '../store/useProjectStore';
import type { ActivityBarView, FileItem } from '../types';
import { useState, useMemo } from 'react';

const ActivityIcon = ({ 
  view, 
  currentView, 
  icon: Icon,
  label 
}: { 
  view: ActivityBarView; 
  currentView: ActivityBarView;
  icon: any;
  label: string;
}) => {
  const setActivityView = useUIStore((state) => state.setActivityBarView);
  
  return (
    <button
      onClick={() => setActivityView(view)}
      className={`w-12 h-12 flex items-center justify-center transition-colors group relative ${
        currentView === view 
          ? 'text-white border-l-2 border-blue-500 bg-gray-800' 
          : 'text-gray-500 hover:text-white hover:bg-gray-800'
      }`}
      title={label}
    >
      <Icon size={22} />
      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {label}
      </span>
    </button>
  );
};

const FileTreeItem = ({ file, level = 0 }: { file: FileItem; level?: number }) => {
  const activeFileId = useProjectStore((state) => state.activeFileId);
  const setActiveFile = useProjectStore((state) => state.setActiveFile);
  const toggleFolder = useProjectStore((state) => state.toggleFolder);
  const deleteFile = useProjectStore((state) => state.deleteFile);
  const renameFile = useProjectStore((state) => state.renameFile);
  const files = useProjectStore((state) => state.files);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(file.name);

  const isFolder = file.type === 'folder';
  const isExpanded = file.isExpanded;
  
  const children = useMemo(() => 
    files.filter((f) => f.parentId === file.id),
    [files, file.id]
  );

  const handleSaveRename = () => {
    if (editName.trim() && editName !== file.name) {
      renameFile(file.id, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer text-sm transition-colors group ${
          activeFileId === file.id
            ? 'bg-blue-600 bg-opacity-20 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => isFolder ? toggleFolder(file.id) : setActiveFile(file.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isFolder && (
          isExpanded ? (
            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
          )
        )}
        {isFolder ? (
          <Folder size={14} className="text-yellow-400 flex-shrink-0" />
        ) : (
          <File size={14} className="text-gray-400 flex-shrink-0" />
        )}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="flex-1 bg-gray-700 border border-blue-500 rounded px-1 text-white text-sm outline-none min-w-0"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{file.name}</span>
        )}
        {(isHovered || activeFileId === file.id) && !isEditing && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-0.5 hover:bg-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Pencil size={12} className="text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`确定要删除 ${file.name} 吗？`)) {
                  deleteFile(file.id);
                }
              }}
              className="p-0.5 hover:bg-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={12} className="text-gray-400 hover:text-red-400" />
            </button>
          </div>
        )}
      </div>
      {isFolder && isExpanded && children.map((child) => (
        <FileTreeItem key={child.id} file={child} level={level + 1} />
      ))}
    </div>
  );
};

const FilesPanel = () => {
  const files = useProjectStore((state) => state.files);
  const createFile = useProjectStore((state) => state.createFile);
  const createFolder = useProjectStore((state) => state.createFolder);
  
  const [newFileName, setNewFileName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  const rootFiles = useMemo(() => 
    files.filter((f) => f.parentId === null),
    [files]
  );

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createFile(newFileName.trim());
      setNewFileName('');
      setShowNewFile(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700 flex items-center justify-between">
        <span>资源管理器</span>
        <div className="flex gap-1">
          <button
            onClick={() => setShowNewFile(true)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="新建文件"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setShowNewFolder(true)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="新建文件夹"
          >
            <Folder size={14} />
          </button>
        </div>
      </div>
      
      {showNewFile && (
        <div className="px-2 py-2 border-b border-gray-700">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="文件名"
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFile();
              if (e.key === 'Escape') setShowNewFile(false);
            }}
            onBlur={() => setShowNewFile(false)}
          />
        </div>
      )}

      {showNewFolder && (
        <div className="px-2 py-2 border-b border-gray-700">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="文件夹名"
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') setShowNewFolder(false);
            }}
            onBlur={() => setShowNewFolder(false)}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-1">
        {rootFiles.map((file) => (
          <FileTreeItem key={file.id} file={file} />
        ))}
      </div>
      <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-700">
        {files.length} 个项目
      </div>
    </div>
  );
};

const SearchPanel = () => {
  const { searchQuery, setSearchQuery } = useUIStore();
  const files = useProjectStore((state) => state.files);
  const { setActiveFile } = useProjectStore();
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  const filteredFiles = files.filter(
    (f) => f.type === 'file' && f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
        搜索
      </div>
      <div className="p-2 border-b border-gray-700 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文件"
            className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400"
            title="替换"
          >
            <ChevronRight size={16} className={showReplace ? 'rotate-90' : ''} />
          </button>
        </div>
        {showReplace && (
          <input
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="替换为"
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchQuery ? '未找到匹配的文件' : '输入关键词搜索'}
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-700 text-sm text-gray-300 flex items-center gap-2"
            >
              <File size={14} className="text-gray-400" />
              <span className="flex-1 truncate">{file.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SettingsPanel = () => {
  const { settings, updateSettings } = useUIStore();

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
        设置
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">主题</label>
          <select
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="dark">深色</option>
            <option value="light">浅色</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">字体大小</label>
          <input
            type="number"
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            min={10}
            max={24}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Tab 大小</label>
          <input
            type="number"
            value={settings.tabSize}
            onChange={(e) => updateSettings({ tabSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            min={2}
            max={8}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">自动换行</label>
          <button
            onClick={() => updateSettings({ wordWrap: !settings.wordWrap })}
            className={`w-10 h-5 rounded-full transition-colors ${
              settings.wordWrap ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.wordWrap ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">自动保存</label>
          <button
            onClick={() => updateSettings({ autoSave: !settings.autoSave })}
            className={`w-10 h-5 rounded-full transition-colors ${
              settings.autoSave ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.autoSave ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

const ExtensionsPanel = () => {
  const installedPackages = useProjectStore((state) => state.installedPackages);
  const { installPackage, uninstallPackage } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');

  const popularPackages = [
    { name: 'axios', description: 'HTTP 客户端' },
    { name: 'lodash', description: '实用工具库' },
    { name: 'react-router-dom', description: 'React 路由' },
    { name: 'vue-router', description: 'Vue 路由' },
    { name: 'dayjs', description: '日期处理库' },
    { name: 'zustand', description: '状态管理' },
  ];

  const filteredPackages = popularPackages.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
        依赖管理
      </div>
      <div className="p-2 border-b border-gray-700">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索 npm 包"
          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {installedPackages.length > 0 && (
          <div className="border-b border-gray-700">
            <div className="px-3 py-2 text-xs text-gray-400 font-medium">已安装</div>
            {installedPackages.map((pkg) => (
              <div
                key={pkg}
                className="px-3 py-2 flex items-center justify-between hover:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-green-400" />
                  <span className="text-sm text-gray-300">{pkg}</span>
                </div>
                <button
                  onClick={() => uninstallPackage(pkg)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  卸载
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="px-3 py-2 text-xs text-gray-400 font-medium">推荐</div>
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.name}
            className="px-3 py-2 flex items-center justify-between hover:bg-gray-700"
          >
            <div>
              <div className="text-sm text-gray-300">{pkg.name}</div>
              <div className="text-xs text-gray-500">{pkg.description}</div>
            </div>
            {!installedPackages.includes(pkg.name) && (
              <button
                onClick={() => installPackage(pkg.name)}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                安装
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ActivityBar = () => {
  const currentView = useUIStore((state) => state.activityBarView);

  const renderPanel = () => {
    switch (currentView) {
      case 'files':
        return <FilesPanel />;
      case 'search':
        return <SearchPanel />;
      case 'settings':
        return <SettingsPanel />;
      case 'extensions':
        return <ExtensionsPanel />;
      default:
        return <FilesPanel />;
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-12 bg-gray-900 border-r border-gray-700 flex flex-col">
        <ActivityIcon view="files" currentView={currentView} icon={Files} label="资源管理器" />
        <ActivityIcon view="search" currentView={currentView} icon={Search} label="搜索" />
        <ActivityIcon view="extensions" currentView={currentView} icon={Package} label="依赖" />
        <div className="flex-1" />
        <ActivityIcon view="settings" currentView={currentView} icon={Settings} label="设置" />
      </div>
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        {renderPanel()}
      </div>
    </div>
  );
};
