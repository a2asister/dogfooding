import React, { useState } from 'react';
import { Bell, Search, Menu, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Modal from '@/components/ui/Modal';
import { formatDateTime } from '@/utils';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (id: string) => {
    markNotificationRead(id);
  };

  const getNotificationTypeColor = (type: string) => {
    const map: Record<string, string> = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    };
    return map[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单、客户、客房..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{new Date().toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
        </div>
      </header>

      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="通知中心"
        size="md"
      >
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">暂无通知</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  notification.isRead ? 'bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getNotificationTypeColor(
                      notification.type
                    )}`}
                  >
                    {notification.type === 'info'
                      ? '信息'
                      : notification.type === 'warning'
                      ? '警告'
                      : notification.type === 'success'
                      ? '成功'
                      : '错误'}
                  </span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 mt-2">{notification.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDateTime(notification.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </Modal>
    </>
  );
};

export default Header;
