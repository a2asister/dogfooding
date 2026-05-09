import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import FileGrid from './components/FileGrid.jsx';
import BatchToolbar from './components/BatchToolbar.jsx';
import PreviewModal from './components/PreviewModal.jsx';
import RenameModal from './components/RenameModal.jsx';
import MoveModal from './components/MoveModal.jsx';
import DeleteConfirmModal from './components/DeleteConfirmModal.jsx';
import Toast from './components/Toast.jsx';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function App() {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        type: selectedType,
        search: searchQuery,
        sortBy,
        sortOrder
      };
      const response = await axios.get('/api/files', { params });
      setFiles(response.data.files);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchQuery, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFileSelect = (fileId, event) => {
    if (event) event.stopPropagation();
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      }
      return [...prev, fileId];
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(f => f.id));
    }
  };

  const handleFileDoubleClick = (file) => {
    setPreviewFile(file);
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
  };

  const handleBatchMove = () => {
    setShowMoveModal(true);
  };

  const handleBatchDelete = () => {
    setShowDeleteModal(true);
  };

  const handleBatchRename = () => {
    if (selectedFiles.length >= 1) {
      setShowRenameModal(true);
    }
  };

  const confirmMove = async (newPath) => {
    try {
      const response = await axios.post('/api/files/move', {
        fileIds: selectedFiles,
        newPath
      });
      setShowMoveModal(false);
      setSelectedFiles([]);
      fetchFiles();
      fetchStats();
      showToast(response.data.message || `成功移动 ${selectedFiles.length} 个文件`, 'success');
    } catch (error) {
      console.error('移动文件失败:', error);
      const errorMsg = error.response?.data?.error || '移动文件失败，请重试';
      showToast(errorMsg, 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.post('/api/files/delete', {
        fileIds: selectedFiles
      });
      setShowDeleteModal(false);
      setSelectedFiles([]);
      fetchFiles();
      fetchStats();
      showToast(`成功删除 ${response.data.deleted} 个文件`, 'success');
    } catch (error) {
      console.error('删除文件失败:', error);
      showToast('删除文件失败，请重试', 'error');
    }
  };

  const confirmRename = async (newName) => {
    try {
      await axios.post('/api/files/rename', {
        fileId: selectedFiles[0],
        newName
      });
      setShowRenameModal(false);
      setSelectedFiles([]);
      fetchFiles();
      fetchStats();
      showToast('文件重命名成功', 'success');
    } catch (error) {
      console.error('重命名文件失败:', error);
      showToast('重命名文件失败，请重试', 'error');
    }
  };

  const confirmBatchRename = async (mode, data) => {
    try {
      let renamedCount = 0;
      if (mode === 'pattern') {
        const response = await axios.post('/api/files/batch-rename-pattern', {
          fileIds: selectedFiles,
          pattern: data.pattern,
          startIndex: data.startIndex || 1
        });
        renamedCount = response.data.renamed;
      } else if (mode === 'individual') {
        const response = await axios.post('/api/files/batch-rename', {
          renames: data.renames
        });
        renamedCount = response.data.renamed;
      }
      setShowRenameModal(false);
      setSelectedFiles([]);
      fetchFiles();
      fetchStats();
      showToast(`成功重命名 ${renamedCount} 个文件`, 'success');
    } catch (error) {
      console.error('批量重命名失败:', error);
      showToast('批量重命名失败，请重试', 'error');
    }
  };

  const getCurrentFileForRename = () => {
    if (selectedFiles.length === 1) {
      return files.find(f => f.id === selectedFiles[0]);
    }
    return null;
  };

  return (
    <div className="app-container">
      <Sidebar
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
        stats={stats}
      />
      
      <div className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          stats={stats}
          formatSize={formatSize}
          totalFiles={files.length}
          selectedCount={selectedFiles.length}
          onSelectAll={handleSelectAll}
        />
        
        <FileGrid
          files={files}
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onFileDoubleClick={handleFileDoubleClick}
          loading={loading}
        />
      </div>

      {selectedFiles.length > 0 && (
        <BatchToolbar
          selectedCount={selectedFiles.length}
          onClear={handleClearSelection}
          onMove={handleBatchMove}
          onDelete={handleBatchDelete}
          onRename={handleBatchRename}
          canRename={selectedFiles.length === 1}
        />
      )}

      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          formatSize={formatSize}
        />
      )}

      {showRenameModal && (
        <RenameModal
          files={files.filter(f => selectedFiles.includes(f.id))}
          isBatch={selectedFiles.length > 1}
          onConfirmSingle={confirmRename}
          onConfirmBatch={confirmBatchRename}
          onCancel={() => setShowRenameModal(false)}
        />
      )}

      {showMoveModal && (
        <MoveModal
          fileCount={selectedFiles.length}
          onConfirm={confirmMove}
          onCancel={() => setShowMoveModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          fileCount={selectedFiles.length}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
