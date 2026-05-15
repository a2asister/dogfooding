import React, { useState, useEffect, useRef } from 'react';
import { FileItem, SortField, SortOrder } from '../types';
import { filesApi } from '../services/api';
import { useClipboard } from '../contexts/ClipboardContext';

interface FileExplorerProps {
  onOpenFile: (file: FileItem) => void;
  showTrash?: boolean;
}

const iconMap: Record<string, string> = {
  folder: '📁',
  file: '📄',
  quick: '⚡',
  thisPc: '💻',
  desktop: '🖥️',
  documents: '📄',
  downloads: '⬇️',
  trash: '🗑️',
};

const FileExplorer: React.FC<FileExplorerProps> = ({ onOpenFile, showTrash = false }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<number | null>(null);
  const [pathHistory, setPathHistory] = useState<Array<{ id: number | null; name: string }>>([
    { id: null, name: showTrash ? '回收站' : '根目录' },
  ]);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId?: number } | null>(null);
  const [sortField, setSortField] = useState<SortField>(SortField.NAME);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const { clipboardItems, copyFiles, cutFiles, clearClipboard, hasClipboardItems } = useClipboard();

  const loadFiles = async (parentId: number | null = null) => {
    try {
      if (showTrash) {
        const response = await filesApi.getTrash();
        setFiles(response.data);
      } else {
        const response = await filesApi.getFiles(parentId || undefined, sortField, sortOrder);
        setFiles(response.data.filter((f) => f.parentId === parentId && !f.isDeleted));
      }
    } catch (err) {
      console.error('加载文件失败', err);
    }
  };

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath, sortField, sortOrder, showTrash]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      }
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      }
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        handleCut();
      }
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
      if (e.key === 'Delete') {
        e.preventDefault();
        if (showTrash) {
          handleBatchPermanentDelete();
        } else {
          handleBatchDelete();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedFiles, showTrash]);

  const handleSelectAll = () => {
    const allIds = files.map(f => f.id);
    setSelectedFiles(new Set(allIds));
  };

  const handleClearSelection = () => {
    setSelectedFiles(new Set());
  };

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

  const handleRename = async (file: FileItem) => {
    const newName = prompt('输入新名称:', file.name);
    if (newName && newName !== file.name) {
      await filesApi.updateFile(file.id, { name: newName });
      loadFiles(currentPath);
      setContextMenu(null);
    }
  };

  const handlePaste = async () => {
    if (!hasClipboardItems() || isBatchProcessing) return;
    setIsBatchProcessing(true);
    try {
      const fileIds = clipboardItems.map(item => item.file.id);
      const isCutOperation = clipboardItems.some(item => item.operation === 'cut');
      
      if (isCutOperation) {
        await filesApi.batchOperation({
          fileIds,
          operation: 'move',
          targetParentId: currentPath ?? undefined,
        });
        clearClipboard();
      } else {
        await filesApi.batchOperation({
          fileIds,
          operation: 'copy',
          targetParentId: currentPath ?? undefined,
        });
      }
      loadFiles(currentPath);
    } catch (err: any) {
      alert(err.response?.data?.message || '粘贴失败');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleCopy = () => {
    const filesToCopy = files.filter(f => selectedFiles.has(f.id));
    if (filesToCopy.length > 0) {
      copyFiles(filesToCopy);
      setContextMenu(null);
    }
  };

  const handleCut = () => {
    const filesToCut = files.filter(f => selectedFiles.has(f.id));
    if (filesToCut.length > 0) {
      cutFiles(filesToCut);
      setContextMenu(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0 || isBatchProcessing) return;
    if (confirm(`确定要将选中的 ${selectedFiles.size} 个文件移到回收站吗？`)) {
      setIsBatchProcessing(true);
      try {
        await filesApi.batchOperation({
          fileIds: Array.from(selectedFiles),
          operation: 'delete',
        });
        loadFiles(currentPath);
        setSelectedFiles(new Set());
        setContextMenu(null);
      } finally {
        setIsBatchProcessing(false);
      }
    }
  };

  const handleBatchCopy = async () => {
    if (selectedFiles.size === 0 || isBatchProcessing) return;
    const targetParentId = prompt('输入目标文件夹 ID (留空表示根目录):');
    if (targetParentId === null) return;
    
    const parsedId = targetParentId === '' ? null : parseInt(targetParentId, 10);
    if (targetParentId !== '' && isNaN(parsedId!)) {
      alert('无效的文件夹 ID');
      return;
    }

    setIsBatchProcessing(true);
    try {
      await filesApi.batchOperation({
        fileIds: Array.from(selectedFiles),
        operation: 'copy',
        targetParentId: parsedId ?? undefined,
      });
      loadFiles(currentPath);
      setSelectedFiles(new Set());
      alert(`成功复制 ${selectedFiles.size} 个文件`);
    } catch (err: any) {
      alert(err.response?.data?.message || '批量复制失败');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBatchMove = async () => {
    if (selectedFiles.size === 0 || isBatchProcessing) return;
    const targetParentId = prompt('输入目标文件夹 ID (留空表示根目录):');
    if (targetParentId === null) return;
    
    const parsedId = targetParentId === '' ? null : parseInt(targetParentId, 10);
    if (targetParentId !== '' && isNaN(parsedId!)) {
      alert('无效的文件夹 ID');
      return;
    }

    setIsBatchProcessing(true);
    try {
      await filesApi.batchOperation({
        fileIds: Array.from(selectedFiles),
        operation: 'move',
        targetParentId: parsedId ?? undefined,
      });
      loadFiles(currentPath);
      setSelectedFiles(new Set());
      alert(`成功移动 ${selectedFiles.size} 个文件`);
    } catch (err: any) {
      alert(err.response?.data?.message || '批量移动失败');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBatchRestore = async () => {
    if (selectedFiles.size === 0 || isBatchProcessing) return;
    if (confirm(`确定要还原选中的 ${selectedFiles.size} 个文件吗？`)) {
      setIsBatchProcessing(true);
      try {
        await filesApi.batchOperation({
          fileIds: Array.from(selectedFiles),
          operation: 'restore',
        });
        loadFiles(currentPath);
        setSelectedFiles(new Set());
        setContextMenu(null);
      } finally {
        setIsBatchProcessing(false);
      }
    }
  };

  const handleBatchPermanentDelete = async () => {
    if (selectedFiles.size === 0 || isBatchProcessing) return;
    if (confirm(`确定要永久删除选中的 ${selectedFiles.size} 个文件吗？此操作不可恢复！`)) {
      setIsBatchProcessing(true);
      try {
        await Promise.all(
          Array.from(selectedFiles).map(id => filesApi.permanentlyDelete(id))
        );
        loadFiles(currentPath);
        setSelectedFiles(new Set());
        setContextMenu(null);
      } finally {
        setIsBatchProcessing(false);
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (isBatchProcessing) return;
    if (confirm('确定要清空回收站吗？此操作不可恢复！')) {
      setIsBatchProcessing(true);
      try {
        await filesApi.emptyTrash();
        loadFiles(currentPath);
      } finally {
        setIsBatchProcessing(false);
      }
    }
  };

  const handleDoubleClick = (file: FileItem) => {
    if (showTrash) return;
    if (file.type === 'folder') {
      setCurrentPath(file.id);
      setPathHistory([...pathHistory, { id: file.id, name: file.name }]);
      setSelectedFiles(new Set());
    } else {
      onOpenFile(file);
    }
  };

  const handleNavigateBack = (index: number) => {
    const newHistory = pathHistory.slice(0, index + 1);
    setPathHistory(newHistory);
    setCurrentPath(newHistory[index].id);
    setSelectedFiles(new Set());
  };

  const handleGoBack = () => {
    if (pathHistory.length > 1) {
      handleNavigateBack(pathHistory.length - 2);
    }
  };

  const handleRightClick = (e: React.MouseEvent, file?: FileItem) => {
    e.preventDefault();
    if (file) {
      if (!e.ctrlKey && !selectedFiles.has(file.id)) {
        setSelectedFiles(new Set([file.id]));
      } else if (e.ctrlKey) {
        const newSelected = new Set(selectedFiles);
        if (newSelected.has(file.id)) {
          newSelected.delete(file.id);
        } else {
          newSelected.add(file.id);
        }
        setSelectedFiles(newSelected);
      }
      setContextMenu({ x: e.clientX, y: e.clientY, fileId: file.id });
    } else {
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const handleFileClick = (e: React.MouseEvent, file: FileItem) => {
    if (e.ctrlKey) {
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(file.id)) {
        newSelected.delete(file.id);
      } else {
        newSelected.add(file.id);
      }
      setSelectedFiles(newSelected);
    } else {
      setSelectedFiles(new Set([file.id]));
    }
  };

  const getSelectedFile = () => {
    return files.find((f) => selectedFiles.has(f.id));
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    } else {
      setSortField(field);
      setSortOrder(SortOrder.ASC);
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    return sortOrder === SortOrder.ASC ? ' ↑' : ' ↓';
  };

  const getClipboardStatus = () => {
    if (!hasClipboardItems()) return '';
    const count = clipboardItems.length;
    const isCut = clipboardItems.some(item => item.operation === 'cut');
    return `${isCut ? '剪切' : '复制'} ${count} 项`;
  };

  return (
    <div className="file-explorer">
      <div className="explorer-toolbar">
        <button className="toolbar-button" onClick={handleGoBack} disabled={pathHistory.length <= 1 || showTrash}>
          ◀
        </button>
        <button className="toolbar-button" disabled={true}>
          ▶
        </button>
        <div className="address-bar">
          {pathHistory.map((path, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="address-separator">›</span>}
              <span
                className="address-part"
                onClick={() => !showTrash && handleNavigateBack(index)}
                style={{ cursor: showTrash ? 'default' : 'pointer' }}
              >
                {path.name}
              </span>
            </React.Fragment>
          ))}
        </div>
        {!showTrash && (
          <>
            <button 
              className="toolbar-button" 
              onClick={handlePaste} 
              disabled={!hasClipboardItems() || isBatchProcessing}
              title={getClipboardStatus()}
            >
              📋 粘贴
            </button>
          </>
        )}
        {isBatchProcessing && (
          <span style={{ color: '#666', marginLeft: '8px', fontSize: '12px' }}>处理中...</span>
        )}
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
            <div className={`sidebar-item ${!showTrash ? 'active' : ''}`}>
              <span className="sidebar-icon">{iconMap.thisPc}</span>
              <span>根目录</span>
            </div>
            <div className={`sidebar-item ${showTrash ? 'active' : ''}`}>
              <span className="sidebar-icon">{iconMap.trash}</span>
              <span>回收站</span>
            </div>
          </div>
        </div>

        <div className="file-content">
          <div className="file-actions">
            {!showTrash ? (
              <>
                <button className="action-button" onClick={handleCreateFolder} disabled={isBatchProcessing}>
                  <span>📁</span> 新建文件夹
                </button>
                <button className="action-button" onClick={handleCreateFile} disabled={isBatchProcessing}>
                  <span>📄</span> 新建文本文档
                </button>
                <button className="action-button" onClick={handleSelectAll} disabled={isBatchProcessing}>
                  <span>☑️</span> 全选
                </button>
                {selectedFiles.size > 0 && (
                  <button className="action-button" onClick={handleClearSelection} disabled={isBatchProcessing}>
                    <span>☐</span> 取消选择
                  </button>
                )}
                {selectedFiles.size > 0 && (
                  <>
                    <button className="action-button" onClick={handleCopy} disabled={isBatchProcessing}>
                      <span>📋</span> 复制 ({selectedFiles.size})
                    </button>
                    <button className="action-button" onClick={handleCut} disabled={isBatchProcessing}>
                      <span>✂️</span> 剪切 ({selectedFiles.size})
                    </button>
                    <button className="action-button" onClick={handleBatchCopy} disabled={isBatchProcessing}>
                      <span>📦</span> 复制到... ({selectedFiles.size})
                    </button>
                    <button className="action-button" onClick={handleBatchMove} disabled={isBatchProcessing}>
                      <span>➡️</span> 移动到... ({selectedFiles.size})
                    </button>
                    <button className="action-button delete" onClick={handleBatchDelete} disabled={isBatchProcessing}>
                      <span>🗑️</span> 删除 ({selectedFiles.size})
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button className="action-button" onClick={handleEmptyTrash} disabled={isBatchProcessing}>
                  <span>🗑️</span> 清空回收站
                </button>
                <button className="action-button" onClick={handleSelectAll} disabled={isBatchProcessing}>
                  <span>☑️</span> 全选
                </button>
                {selectedFiles.size > 0 && (
                  <button className="action-button" onClick={handleClearSelection} disabled={isBatchProcessing}>
                    <span>☐</span> 取消选择
                  </button>
                )}
                {selectedFiles.size > 0 && (
                  <>
                    <button className="action-button" onClick={handleBatchRestore} disabled={isBatchProcessing}>
                      <span>↩️</span> 还原 ({selectedFiles.size})
                    </button>
                    <button className="action-button delete" onClick={handleBatchPermanentDelete} disabled={isBatchProcessing}>
                      <span>⚠️</span> 永久删除 ({selectedFiles.size})
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <div className="file-header">
            <div
              className="file-col-name clickable"
              onClick={() => handleSort(SortField.NAME)}
            >
              名称{getSortIndicator(SortField.NAME)}
            </div>
            <div
              className="file-col-date clickable"
              onClick={() => handleSort(showTrash ? SortField.NAME : SortField.UPDATED_AT)}
            >
              {showTrash ? '删除时间' : '修改日期'}{getSortIndicator(SortField.UPDATED_AT)}
            </div>
            <div
              className="file-col-type clickable"
              onClick={() => handleSort(SortField.TYPE)}
            >
              类型{getSortIndicator(SortField.TYPE)}
            </div>
            <div
              className="file-col-size clickable"
              onClick={() => handleSort(SortField.SIZE)}
            >
              {showTrash ? '原始路径' : '大小'}{getSortIndicator(SortField.SIZE)}
            </div>
          </div>

          <div className="file-list-view">
            {files.map((file) => (
              <div
                key={file.id}
                className={`file-row ${selectedFiles.has(file.id) ? 'selected' : ''}`}
                onClick={(e) => handleFileClick(e, file)}
                onDoubleClick={() => handleDoubleClick(file)}
                onContextMenu={(e) => handleRightClick(e, file)}
              >
                <div className="file-col-name">
                  <span className="file-icon">{iconMap[file.type]}</span>
                  <span>{file.name}</span>
                </div>
                <div className="file-col-date">
                  {showTrash && file.deletedAt
                    ? new Date(file.deletedAt).toLocaleString('zh-CN')
                    : new Date(file.updatedAt).toLocaleDateString('zh-CN')}
                </div>
                <div className="file-col-type">
                  {file.type === 'folder' ? '文件夹' : '文本文档'}
                </div>
                <div className="file-col-size">
                  {showTrash
                    ? file.originalPath || '未知'
                    : file.type === 'folder' ? '' : formatSize(file.size)}
                </div>
              </div>
            ))}
            {files.length === 0 && (
              <div className="empty-folder">
                <span className="empty-icon">{showTrash ? '🗑️' : '📂'}</span>
                <p>{showTrash ? '回收站为空' : '此文件夹为空'}</p>
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
          {contextMenu.fileId && !showTrash && (
            <>
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
            </>
          )}
          {!showTrash ? (
            <>
              <div className="context-menu-item" onClick={handleCopy}>
                复制
              </div>
              <div className="context-menu-item" onClick={handleCut}>
                剪切
              </div>
              {hasClipboardItems() && (
                <div className="context-menu-item" onClick={handlePaste}>
                  粘贴
                </div>
              )}
              <div className="context-menu-divider" />
              {selectedFiles.size > 0 && (
                <>
                  <div className="context-menu-item" onClick={handleBatchCopy}>
                    复制到...
                  </div>
                  <div className="context-menu-item" onClick={handleBatchMove}>
                    移动到...
                  </div>
                </>
              )}
              {contextMenu.fileId && (
                <div
                  className="context-menu-item"
                  onClick={() => {
                    const file = getSelectedFile();
                    if (file) handleRename(file);
                  }}
                >
                  重命名
                </div>
              )}
              {selectedFiles.size > 0 && (
                <div className="context-menu-item delete" onClick={handleBatchDelete}>
                  删除
                </div>
              )}
            </>
          ) : (
            <>
              {selectedFiles.size > 0 && (
                <>
                  <div className="context-menu-item" onClick={handleBatchRestore}>
                    还原
                  </div>
                  <div className="context-menu-divider" />
                  <div className="context-menu-item delete" onClick={handleBatchPermanentDelete}>
                    永久删除
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
