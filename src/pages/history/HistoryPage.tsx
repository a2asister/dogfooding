import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobStore } from '@/store';
import type { BrowseHistory } from '@/types';
import JobCard from '@/components/jobs/JobCard';
import { ConfirmModal, AlertModal } from '@/components/common/Modal';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchBrowseHistory, clearBrowseHistory, removeFromBrowseHistory } = useJobStore();
  const [history, setHistory] = useState<BrowseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BrowseHistory | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchBrowseHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedHistory = history.reduce((acc, item) => {
    const date = new Date(item.viewedAt).toLocaleDateString('zh-CN');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, BrowseHistory[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = async () => {
    await clearBrowseHistory();
    setHistory([]);
    setShowClearConfirm(false);
    setAlertConfig({
      title: '已清空',
      message: '浏览记录已全部清空',
      type: 'info',
    });
    setShowAlert(true);
  };

  const handleDelete = (item: BrowseHistory) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    await removeFromBrowseHistory(selectedItem.id);
    setHistory((prev) => prev.filter((h) => h.id !== selectedItem.id));
    setShowDeleteConfirm(false);
    setAlertConfig({
      title: '已删除',
      message: '该浏览记录已删除',
      type: 'info',
    });
    setShowAlert(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 flex-1">浏览记录</h1>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                清空
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-gray-700 font-medium mb-2">暂无浏览记录</h3>
            <p className="text-gray-500 text-sm mb-4">您还没有浏览过任何职位</p>
            <button onClick={() => navigate('/jobs')} className="btn-primary px-6 py-2">
              去浏览职位
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-500">{formatDate(date)}</h3>
                </div>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {item.type === 'job' && item.targetData && (
                          <JobCard job={item.targetData as Job} />
                        )}
                        {item.type === 'company' && item.targetData && (
                          <div
                            className="bg-white rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/company/${item.targetId}`)}
                          >
                            <img
                              src={(item.targetData as Company).logo}
                              alt={(item.targetData as Company).name}
                              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://picsum.photos/56/56';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {(item.targetData as Company).name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {(item.targetData as Company).industry} · {(item.targetData as Company).size}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-400">
                                  在招: {(item.targetData as Company).jobCount} 个职位
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(item)}
                        className="flex-shrink-0 mt-4 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all"
                        title="删除该条浏览记录"
                      >
                        <svg className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="确认清空"
        message="确定要清空所有浏览记录吗？此操作不可恢复。"
        confirmText="确认清空"
        danger={true}
        onConfirm={confirmClearAll}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除"
        message={`确定要删除这条浏览记录吗？`}
        confirmText="确认删除"
        danger={true}
        onConfirm={confirmDelete}
      />

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
};

export default HistoryPage;
