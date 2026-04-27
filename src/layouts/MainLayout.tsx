import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import TabBar from '@/components/common/TabBar';
import { useMessageStore } from '@/store';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getUnreadCount } = useMessageStore();
  const unreadCount = getUnreadCount();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/home', { replace: true });
    }
  }, [location.pathname, navigate]);

  const hideTabBar = 
    location.pathname.startsWith('/jobs/') && location.pathname !== '/jobs' ||
    location.pathname.startsWith('/messages/') && location.pathname !== '/messages' ||
    location.pathname.startsWith('/company/') ||
    location.pathname === '/settings' ||
    location.pathname === '/resume';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      {!hideTabBar && (
        <TabBar unreadCount={unreadCount} />
      )}
    </div>
  );
};

export default MainLayout;
