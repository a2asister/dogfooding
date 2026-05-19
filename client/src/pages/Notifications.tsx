import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { communityApi } from '../api';
import type { Notification } from '../types';

export default function Notifications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const unreadOnly = searchParams.get('unread') === '1';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: { page?: number; limit?: number; unread?: boolean } = {
          page,
          limit: 20,
        };
        if (unreadOnly) params.unread = true;
        
        const [notifsRes, countRes] = await Promise.all([
          communityApi.getNotifications(params),
          communityApi.getUnreadCount(),
        ]);
        setNotifications(notifsRes.data.data);
        setTotal(notifsRes.data.total);
        setUnreadCount(countRes.data.count);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [page, unreadOnly]);

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try {
      await communityApi.markNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read:', error);
    } finally {
      setMarkingRead(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      like: '👍',
      favorite: '⭐',
      comment: '💬',
      answer: '📝',
      accept: '✅',
      join: '🤝',
      approve: '✔️',
      system: '🔔',
      badge: '🏅',
      level_up: '🎊',
    };
    return icons[type] || '📢';
  };

  const getNotificationLink = (notif: Notification) => {
    if (notif.related_type === 'article' && notif.related_id) {
      return `/articles/${notif.related_id}`;
    }
    if (notif.related_type === 'question' && notif.related_id) {
      return `/questions/${notif.related_id}`;
    }
    if (notif.related_type === 'project' && notif.related_id) {
      return `/projects/${notif.related_id}`;
    }
    if (notif.related_type === 'user' && notif.related_id) {
      return `/users/${notif.related_id}`;
    }
    return '#';
  };

  const totalPages = Math.ceil(total / 20);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">消息通知</h1>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                {unreadCount} 条未读
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (unreadOnly) {
                  params.delete('unread');
                } else {
                  params.set('unread', '1');
                }
                params.delete('page');
                setSearchParams(params);
              }}
              className={`px-3 py-1 rounded text-sm ${
                unreadOnly ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
              }`}
            >
              {unreadOnly ? '全部' : '只看未读'}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingRead}
                className="text-primary-600 hover:text-primary-700 text-sm disabled:opacity-50"
              >
                {markingRead ? '处理中...' : '全部已读'}
              </button>
            )}
          </div>
        </div>

        <div className="divide-y">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <Link
                key={notif.id}
                to={getNotificationLink(notif)}
                className={`flex items-start space-x-4 p-6 hover:bg-gray-50 transition-colors ${
                  notif.is_read ? 'opacity-60' : ''
                }`}
              >
                <div className="text-2xl">{getNotificationIcon(notif.type)}</div>
                <div className="flex-1">
                  <p className="text-gray-700">{notif.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {dayjs(notif.created_at).fromNow()}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                )}
              </Link>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              暂无{unreadOnly ? '未读' : ''}消息
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 p-6 border-t">
            {page > 1 && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', String(page - 1));
                  setSearchParams(params);
                }}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
              >
                上一页
              </button>
            )}
            <span className="text-sm text-gray-500">
              第 {page} / {totalPages} 页
            </span>
            {page < totalPages && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', String(page + 1));
                  setSearchParams(params);
                }}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
              >
                下一页
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
