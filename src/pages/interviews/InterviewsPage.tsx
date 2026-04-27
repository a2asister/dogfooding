import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Interview } from '@/types';
import { AlertModal, ConfirmModal } from '@/components/common/Modal';

const InterviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  const tabs = [
    { id: 'upcoming', label: '待面试' },
    { id: 'completed', label: '已完成' },
    { id: 'cancelled', label: '已取消' },
  ];

  const mockInterviews: Interview[] = [
    {
      id: '1',
      jobId: 'job_1',
      jobTitle: '高级前端工程师',
      companyId: 'comp_1',
      companyName: '字节跳动',
      companyLogo: 'https://picsum.photos/48/48?random=1',
      interviewTime: new Date(Date.now() + 86400000).toISOString(),
      interviewType: 'video',
      interviewAddress: '腾讯会议',
      interviewer: '李明 - HR',
      interviewerAvatar: 'https://picsum.photos/40/40?random=10',
      status: 'pending',
      notes: '请准备好简历和项目介绍，面试时长约30分钟。',
    },
    {
      id: '2',
      jobId: 'job_2',
      jobTitle: '产品经理',
      companyId: 'comp_2',
      companyName: '阿里巴巴',
      companyLogo: 'https://picsum.photos/48/48?random=2',
      interviewTime: new Date(Date.now() + 172800000).toISOString(),
      interviewType: 'onsite',
      interviewAddress: '杭州市余杭区文一西路969号阿里巴巴西溪园区',
      interviewer: '王芳 - 部门主管',
      interviewerAvatar: 'https://picsum.photos/40/40?random=11',
      status: 'pending',
      notes: '请携带身份证原件，提前15分钟到达。',
    },
    {
      id: '3',
      jobId: 'job_3',
      jobTitle: '后端开发工程师',
      companyId: 'comp_3',
      companyName: '腾讯科技',
      companyLogo: 'https://picsum.photos/48/48?random=3',
      interviewTime: new Date(Date.now() - 86400000).toISOString(),
      interviewType: 'video',
      interviewAddress: '企业微信',
      interviewer: '张伟 - 技术总监',
      interviewerAvatar: 'https://picsum.photos/40/40?random=12',
      status: 'completed',
      notes: '',
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setInterviews(mockInterviews);
      setLoading(false);
    }, 500);
  }, []);

  const getFilteredInterviews = () => {
    switch (activeTab) {
      case 'upcoming':
        return interviews.filter((i) => i.status === 'pending');
      case 'completed':
        return interviews.filter((i) => i.status === 'completed');
      case 'cancelled':
        return interviews.filter((i) => i.status === 'cancelled');
      default:
        return interviews;
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' }),
      time: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'phone':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'video': return '视频面试';
      case 'phone': return '电话面试';
      default: return '现场面试';
    }
  };

  const handleConfirm = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowConfirmModal(true);
  };

  const confirmInterview = () => {
    if (!selectedInterview) return;
    setInterviews((prev) =>
      prev.map((i) => (i.id === selectedInterview.id ? { ...i, status: 'confirmed' } : i))
    );
    setShowConfirmModal(false);
    setAlertConfig({
      title: '确认成功',
      message: '您已确认参加该面试，HR将收到您的确认信息。',
      type: 'success',
    });
    setShowAlert(true);
  };

  const handleDecline = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowDeclineModal(true);
  };

  const declineInterview = () => {
    if (!selectedInterview) return;
    setInterviews((prev) =>
      prev.map((i) => (i.id === selectedInterview.id ? { ...i, status: 'declined' } : i))
    );
    setShowDeclineModal(false);
    setAlertConfig({
      title: '已拒绝',
      message: '您已拒绝该面试，HR将收到您的拒绝信息。',
      type: 'info',
    });
    setShowAlert(true);
  };

  const filteredInterviews = getFilteredInterviews();

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
            <h1 className="text-xl font-bold text-gray-900 flex-1">我的面试</h1>
          </div>

          <div className="flex gap-1">
            {tabs.map((tab) => {
              const count = tab.id === 'upcoming'
                ? interviews.filter((i) => i.status === 'pending').length
                : tab.id === 'completed'
                ? interviews.filter((i) => i.status === 'completed').length
                : interviews.filter((i) => i.status === 'cancelled' || i.status === 'declined').length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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
        ) : filteredInterviews.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-gray-700 font-medium mb-2">
              {activeTab === 'upcoming' ? '暂无待面试' : activeTab === 'completed' ? '暂无已完成面试' : '暂无已取消面试'}
            </h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'upcoming' ? '您还没有收到任何面试邀约' : '您还没有相关的面试记录'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => {
              const { date, time } = formatDateTime(interview.interviewTime);
              return (
                <div key={interview.id} className="bg-white rounded-xl overflow-hidden">
                  <div className="bg-orange-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-orange-700">{date} {time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      {getTypeIcon(interview.interviewType)}
                      <span>{getTypeText(interview.interviewType)}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <img
                        src={interview.companyLogo}
                        alt={interview.companyName}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/48/48';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-medium text-gray-900 truncate cursor-pointer hover:text-primary-600"
                          onClick={() => navigate(`/job/${interview.jobId}`)}
                        >
                          {interview.jobTitle}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{interview.companyName}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div className="flex items-center gap-2">
                          <img
                            src={interview.interviewerAvatar}
                            alt={interview.interviewer}
                            className="w-5 h-5 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://picsum.photos/20/20';
                            }}
                          />
                          <span>{interview.interviewer}</span>
                        </div>
                      </div>

                      {interview.interviewType === 'onsite' && (
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="line-clamp-2">{interview.interviewAddress}</span>
                        </div>
                      )}

                      {interview.notes && (
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-500">{interview.notes}</span>
                        </div>
                      )}
                    </div>

                    {interview.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDecline(interview)}
                          className="flex-1 py-2.5 btn-outline rounded-lg font-medium text-gray-600"
                        >
                          拒绝
                        </button>
                        <button
                          onClick={() => handleConfirm(interview)}
                          className="flex-1 py-2.5 btn-primary rounded-lg font-medium"
                        >
                          确认参加
                        </button>
                      </div>
                    )}

                    {interview.status === 'confirmed' && (
                      <div className="flex gap-3">
                        <button className="flex-1 py-2.5 btn-outline rounded-lg font-medium text-gray-600">
                          修改时间
                        </button>
                        <button
                          onClick={() => navigate(`/messages/chat/${interview.id}`)}
                          className="flex-1 py-2.5 btn-primary rounded-lg font-medium"
                        >
                          私信 HR
                        </button>
                      </div>
                    )}

                    {interview.status === 'completed' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/job/${interview.jobId}`)}
                          className="flex-1 py-2.5 btn-outline rounded-lg font-medium text-gray-600"
                        >
                          查看职位
                        </button>
                        <button className="flex-1 py-2.5 btn-primary rounded-lg font-medium">
                          查看结果
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="确认参加面试"
        message={`确定要确认参加「${selectedInterview?.jobTitle}」的面试吗？`}
        confirmText="确认参加"
        onConfirm={confirmInterview}
      />

      <ConfirmModal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="确认拒绝面试"
        message={`确定要拒绝「${selectedInterview?.jobTitle}」的面试吗？`}
        confirmText="确认拒绝"
        danger={true}
        onConfirm={declineInterview}
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

export default InterviewsPage;
