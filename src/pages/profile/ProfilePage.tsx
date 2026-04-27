import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import type { User } from '@/types';
import { ConfirmModal } from '@/components/common/Modal';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    {
      id: 'resume',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: '我的简历',
      badge: '85%',
      badgeColor: 'bg-green-100 text-green-700',
    },
    {
      id: 'applications',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      label: '我的投递',
      badge: '3 新',
      badgeColor: 'bg-red-100 text-red-600',
    },
    {
      id: 'interviews',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: '我的面试',
      badge: '2 个',
      badgeColor: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'favorites',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      label: '我的收藏',
      badge: '12',
      badgeColor: 'bg-gray-100 text-gray-600',
    },
    {
      id: 'history',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: '浏览记录',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: '设置',
      badge: null,
      badgeColor: '',
    },
  ];

  const quickActions = [
    { id: 'edit-resume', label: '编辑简历', icon: '✏️' },
    { id: 'refresh-resume', label: '刷新简历', icon: '🔄' },
    { id: 'job-matching', label: '匹配岗位', icon: '🎯' },
    { id: 'resume-optimize', label: '简历优化', icon: '✨' },
  ];

  const handleMenuItemClick = (id: string) => {
    switch (id) {
      case 'resume':
        navigate('/resume');
        break;
      case 'applications':
        navigate('/applications');
        break;
      case 'interviews':
        navigate('/interviews');
        break;
      case 'favorites':
        navigate('/favorites');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  const handleQuickAction = (id: string) => {
    switch (id) {
      case 'edit-resume':
        navigate('/resume');
        break;
      default:
        console.log('Quick action:', id);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getJobStatusText = (status: string | undefined) => {
    switch (status) {
      case 'active': return '求职中';
      case 'passive': return '观望机会';
      case 'inactive': return '暂不求职';
      default: return '求职中';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 pt-8 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <img
              src={user?.avatar || 'https://picsum.photos/80/80'}
              alt={user?.nickname || '用户头像'}
              className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/80/80';
              }}
            />

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{user?.nickname || '求职者'}</h2>
                <span className="px-2.5 py-0.5 bg-white/20 text-white text-xs rounded-full">
                  {getJobStatusText(user?.jobStatus)}
                </span>
              </div>
              <p className="text-white/80 text-sm mt-1">
                {user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') || '请完善手机号'}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-white text-sm">简历 85%</span>
                </div>
                <button className="text-white/80 hover:text-white text-sm flex items-center gap-1">
                  <span>完善简历</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className="flex flex-col items-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors ${
                index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="text-primary-600">{item.icon}</div>
              <span className="flex-1 text-left text-gray-800">{item.label}</span>
              {item.badge && (
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-white rounded-xl py-4 text-red-500 font-medium hover:bg-red-50 transition-colors"
        >
          退出登录
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4 text-center">
        <p className="text-gray-400 text-xs">版本 v1.0.0</p>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="确认退出"
        message="确定要退出登录吗？"
        confirmText="退出登录"
        danger={true}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default ProfilePage;
