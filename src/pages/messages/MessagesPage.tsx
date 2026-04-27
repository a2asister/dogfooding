import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessageStore } from '@/store';
import type { MessageSession } from '@/types';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchMessageSessions } = useMessageStore();
  const [sessions, setSessions] = useState<MessageSession[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'all', label: '全部消息', count: 0 },
    { id: 'system', label: '系统通知', count: 0 },
    { id: 'hr', label: 'HR 私信', count: 0 },
    { id: 'interview', label: '面试通知', count: 0 },
  ];

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await fetchMessageSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load message sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSessions = () => {
    if (activeTab === 'all') return sessions;
    return sessions.filter((s) => s.type === activeTab);
  };

  const getUnreadCount = (type: string) => {
    if (type === 'all') return sessions.reduce((sum, s) => sum + s.unreadCount, 0);
    return sessions.filter((s) => s.type === type).reduce((sum, s) => sum + s.unreadCount, 0);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      case 'interview':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'system': return '系统通知';
      case 'hr': return 'HR 私信';
      case 'interview': return '面试通知';
      default: return '消息';
    }
  };

  const filteredSessions = getFilteredSessions();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">消息</h1>
          
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => {
              const count = getUnreadCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full px-1.5">
                      {count > 99 ? '99+' : count}
                    </span>
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
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-gray-700 font-medium mb-2">暂无消息</h3>
            <p className="text-gray-500 text-sm">您还没有收到任何消息</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden">
            {filteredSessions.map((session, index) => (
              <div
                key={session.id}
                onClick={() => navigate(`/messages/chat/${session.id}`)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  index < filteredSessions.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
                  session.type === 'system' ? 'bg-blue-100 text-blue-600' :
                  session.type === 'interview' ? 'bg-purple-100 text-purple-600' :
                  'bg-primary-100 text-primary-600'
                }`}>
                  {session.type === 'hr' ? (
                    <img
                      src={session.avatar}
                      alt={session.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    getTypeIcon(session.type)
                  )}
                  {session.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full px-1.5">
                      {session.unreadCount > 99 ? '99+' : session.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {session.name || getTypeLabel(session.type)}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {new Date(session.lastMessageTime).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {session.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
