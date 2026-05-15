import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Announcement } from './types';
import { announcementApi } from './api';
import { AnnouncementCarousel } from './components/AnnouncementCarousel';
import { AnnouncementModal } from './components/AnnouncementModal';
import { AdminPanel } from './components/AdminPanel';

const userId = 'user_' + Math.random().toString(36).substr(2, 9);

function App() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'admin'>('view');
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementApi.getAll(userId);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('获取公告失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminAnnouncements = async () => {
    try {
      const response = await announcementApi.getAllAdmin();
      setAnnouncements(response.data);
    } catch (error) {
      console.error('获取公告失败:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSelectAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleTabChange = (tab: 'view' | 'admin') => {
    setActiveTab(tab);
    if (tab === 'admin') {
      fetchAdminAnnouncements();
    } else {
      fetchAnnouncements();
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '48px' }}
        >
          📢
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h1
            style={{
              fontSize: '48px',
              color: 'white',
              marginBottom: '10px',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            📢 企业公告系统
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            及时了解企业最新动态和重要通知
          </p>
        </motion.div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '30px',
          }}
        >
          <button
            onClick={() => handleTabChange('view')}
            style={{
              padding: '12px 32px',
              borderRadius: '30px',
              border: 'none',
              background:
                activeTab === 'view'
                  ? 'white'
                  : 'rgba(255,255,255,0.2)',
              color: activeTab === 'view' ? '#667eea' : 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
            }}
          >
            公告浏览
          </button>
          <button
            onClick={() => handleTabChange('admin')}
            style={{
              padding: '12px 32px',
              borderRadius: '30px',
              border: 'none',
              background:
                activeTab === 'admin'
                  ? 'white'
                  : 'rgba(255,255,255,0.2)',
              color: activeTab === 'admin' ? '#667eea' : 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
            }}
          >
            管理后台
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'view' ? (
            <AnnouncementCarousel
              announcements={announcements}
              onSelect={handleSelectAnnouncement}
            />
          ) : (
            <AdminPanel
              announcements={announcements}
              onRefresh={fetchAdminAnnouncements}
              onCreate={announcementApi.create}
              onUpdate={announcementApi.update}
              onDelete={announcementApi.delete}
              onBatchDelete={announcementApi.batchDelete}
              onBatchUpdate={announcementApi.batchUpdate}
            />
          )}
        </motion.div>

        <AnnouncementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          announcement={selectedAnnouncement}
        />
      </div>
    </div>
  );
}

export default App;
