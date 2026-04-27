import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationStore } from '@/store';
import type { Application } from '@/types';
import { AlertModal, ConfirmModal } from '@/components/common/Modal';

const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchApplications, cancelApplication } = useApplicationStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  const tabs = [
    { id: 'all', label: '全部' },
    { id: 'pending', label: '待查看' },
    { id: 'read', label: '已读' },
    { id: 'interview', label: '面试邀约' },
    { id: 'failed', label: '投递失败' },
    { id: 'accepted', label: '已录用' },
    { id: 'rejected', label: '已拒绝' },
  ];

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: '待查看', color: 'bg-blue-100 text-blue-700' },
    read: { label: '已读', color: 'bg-gray-100 text-gray-700' },
    interview: { label: '面试邀约', color: 'bg-orange-100 text-orange-700' },
    failed: { label: '投递失败', color: 'bg-red-100 text-red-700' },
    accepted: { label: '已录用', color: 'bg-green-100 text-green-700' },
    rejected: { label: '已拒绝', color: 'bg-gray-100 text-gray-700' },
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredApplications = () => {
    if (activeTab === 'all') return applications;
    return applications.filter((a) => a.status === activeTab);
  };

  const handleCancel = (application: Application) => {
    setSelectedApplication(application);
    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    if (!selectedApplication) return;
    await cancelApplication(selectedApplication.id);
    setApplications((prev) =>
      prev.map((a) =>
        a.id === selectedApplication.id ? { ...a, status: 'rejected' } : a
      )
    );
    setShowCancelConfirm(false);
    setAlertConfig({
      title: '撤销成功',
      message: '您已成功撤销该职位的投递',
      type: 'success',
    });
    setShowAlert(true);
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredApplications = getFilteredApplications();

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 flex-1">我的投递</h1>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => {
              const count = tab.id === 'all'
                ? applications.length
                : applications.filter((a) => a.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-1 text-xs">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-gray-700 font-medium mb-2">暂无投递记录</h3>
            <p className="text-gray-500 text-sm mb-4">您还没有投递过任何职位</p>
            <button onClick={() => navigate('/jobs')} className="btn-primary px-6 py-2">
              去浏览职位
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden">
            {filteredApplications.map((application, index) => (
              <div
                key={application.id}
                className={`p-4 ${index < filteredApplications.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={application.companyLogo}
                    alt={application.companyName}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/48/48';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3
                        className="font-medium text-gray-900 truncate cursor-pointer hover:text-primary-600"
                        onClick={() => navigate(`/job/${application.jobId}`)}
                      >
                        {application.jobTitle}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${
                        statusConfig[application.status]?.color || 'bg-gray-100 text-gray-700'
                      }`}>
                        {statusConfig[application.status]?.label || application.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-1 truncate">
                      {application.companyName}
                    </p>

                    <p className="text-sm text-orange-500 font-medium mb-2">
                      {application.salaryMin}-{application.salaryMax}K
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        投递时间: {formatDate(application.appliedAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        {application.status === 'interview' && (
                          <button className="text-primary-600 hover:text-primary-700 text-sm">
                            查看详情
                          </button>
                        )}
                        {application.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(application)}
                            className="text-red-500 hover:text-red-600 text-sm"
                          >
                            撤销投递
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/messages/chat/${application.id}`)}
                          className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          私信 HR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="确认撤销"
        message={`确定要撤销对「${selectedApplication?.jobTitle}」的投递吗？`}
        confirmText="确认撤销"
        danger={true}
        onConfirm={confirmCancel}
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

export default ApplicationsPage;
