import React, { useState, useEffect, useRef } from 'react';
import { FileItem } from '../types';
import { filesApi } from '../services/api';

interface FileExplorerProps {
  onOpenFile: (file: FileItem) => void;
}

const iconMap: Record<string, string> = {
  folder: '📁',
  file: '📄',
  quick: '⚡',
  thisPc: '💻',
  desktop: '🖥️',
  documents: '📄',
  downloads: '⬇️',
};

const FileExplorer: React.FC<FileExplorerProps> = ({ onOpenFile }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<number | null>(null);
  const [pathHistory, setPathHistory] = useState<Array<{ id: number | null; name: string }>>([
    { id: null, name: '根目录' },
  ]);
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const loadFiles = async (parentId: number | null = null) => {
    try {
      const response = await filesApi.getFiles(parentId || undefined);
      setFiles(response.data.filter((f) => f.parentId === parentId));
    } catch (err) {
      console.error('加载文件失败', err);
    }
  };

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCreateFolder = async () => {
    const name = prompt('输入文件夹名称:');
    if (name) {
      await filesApi.createFile({ name, type: 'folder', parentId: currentPath || undefined });
      loadFiles(currentPath);
    }
  };

  const handleCreateFile = async () => {
    const name = prompt('输入文件名称:');
    if (name) {
      await filesApi.createFile({ name, type: 'file', parentId: currentPath || undefined });
      loadFiles(currentPath);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (confirm('确定要删除此文件吗？')) {
      await filesApi.deleteFile(fileId);
      loadFiles(currentPath);
      setContextMenu(null);
    }
  };

  const handleRename = async (file: FileItem) => {
    const newName = prompt('输入新名称:', file.name);
    if (newName && newName !== file.name) {
      await filesApi.updateFile(file.id, { name: newName });
      loadFiles(currentPath);
      setContextMenu(null);
    }
  };

  const handleDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.id);
      setPathHistory([...pathHistory, { id: file.id, name: file.name }]);
    } else {
      onOpenFile(file);
    }
  };

  const handleNavigateBack = (index: number) => {
    const newHistory = pathHistory.slice(0, index + 1);
    setPathHistory(newHistory);
    setCurrentPath(newHistory[index].id);
  };

  const handleGoBack = () => {
    if (pathHistory.length > 1) {
      handleNavigateBack(pathHistory.length - 2);
    }
  };

  const handleRightClick = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setSelectedFile(file.id);
    setContextMenu({ x: e.clientX, y: e.clientY, fileId: file.id });
  };

  const getSelectedFile = () => {
    return files.find((f) => f.id === selectedFile);
  };

  return (
    <div className="file-explorer">
      <div className="explorer-toolbar">
        <button className="toolbar-button" onClick={handleGoBack} disabled={pathHistory.length <= 1}>
          ◀
        </button>
        <button className="toolbar-button" onClick={handleGoBack} disabled={true}>
          ▶
        </button>
        <div className="address-bar">
          {pathHistory.map((path, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="address-separator">›</span>}
              <span
                className="address-part"
                onClick={() => handleNavigateBack(index)}
              >
                {path.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="explorer-body">
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">快速访问</div>
            <div className="sidebar-item">
              <span className="sidebar-icon">{iconMap.desktop}</span>
              <span>桌面</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon">{iconMap.downloads}</span>
              <span>下载</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon">{iconMap.documents}</span>
              <span>文档</span>
            </div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">此电脑</div>
            <div className="sidebar-item active">
              <span className="sidebar-icon">{iconMap.thisPc}</span>
              <span>根目录</span>
            </div>
          </div>
        </div>

        <div className="file-content">
          <div className="file-actions">
            <button className="action-button" onClick={handleCreateFolder}>
              <span>📁</span> 新建文件夹
            </button>
            <button className="action-button" onClick={handleCreateFile}>
              <span>📄</span> 新建文本文档
            </button>
          </div>

          <div className="file-header">
            <div className="file-col-name">名称</div>
            <div className="file-col-date">修改日期</div>
            <div className="file-col-type">类型</div>
            <div className="file-col-size">大小</div>
          </div>

          <div className="file-list-view">
            {files.map((file) => (
              <div
                key={file.id}
                className={`file-row ${selectedFile === file.id ? 'selected' : ''}`}
                onClick={() => setSelectedFile(file.id)}
                onDoubleClick={() => handleDoubleClick(file)}
                onContextMenu={(e) => handleRightClick(e, file)}
              >
                <div className="file-col-name">
                  <span className="file-icon">{iconMap[file.type]}</span>
                  <span>{file.name}</span>
                </div>
                <div className="file-col-date">
                  {new Date(file.updatedAt).toLocaleDateString('zh-CN')}
                </div>
                <div className="file-col-type">
                  {file.type === 'folder' ? '文件夹' : '文本文档'}
                </div>
                <div className="file-col-size">
                  {file.type === 'folder' ? '' : '1 KB'}
                </div>
              </div>
            ))}
            {files.length === 0 && (
              <div className="empty-folder">
                <span className="empty-icon">📂</span>
                <p>此文件夹为空</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="file-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div
            className="context-menu-item"
            onClick={() => {
              const file = getSelectedFile();
              if (file) handleDoubleClick(file);
            }}
          >
            打开
          </div>
          <div className="context-menu-divider" />
          <div
            className="context-menu-item"
            onClick={() => {
              const file = getSelectedFile();
              if (file) handleRename(file);
            }}
          >
            重命名
          </div>
          <div className="context-menu-divider" />
          <div
            className="context-menu-item delete"
            onClick={() => handleDelete(contextMenu.fileId)}
          >
            删除
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
