import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Announcement, AnnouncementPriority } from '../types';

interface AnnouncementCarouselProps {
  announcements: Announcement[];
  onSelect: (announcement: Announcement) => void;
}

const priorityColors: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.LOW]: '#4caf50',
  [AnnouncementPriority.MEDIUM]: '#ff9800',
  [AnnouncementPriority.HIGH]: '#f44336',
  [AnnouncementPriority.URGENT]: '#e91e63',
};

const priorityLabels: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.LOW]: '低',
  [AnnouncementPriority.MEDIUM]: '中',
  [AnnouncementPriority.HIGH]: '高',
  [AnnouncementPriority.URGENT]: '紧急',
};

export const AnnouncementCarousel: React.FC<AnnouncementCarouselProps> = ({
  announcements,
  onSelect,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];
  const visibleAnnouncements = safeAnnouncements.filter((a) => a.status === 'published');

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(visibleAnnouncements.length, 1));
    setProgress(0);
  }, [visibleAnnouncements.length]);

  useEffect(() => {
    if (isHovered || visibleAnnouncements.length <= 1) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isHovered, visibleAnnouncements.length, goToNext]);

  if (visibleAnnouncements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <p style={{ color: '#666', fontSize: '18px' }}>暂无公告</p>
      </motion.div>
    );
  }

  const currentAnnouncement = visibleAnnouncements[currentIndex];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAnnouncement.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => onSelect(currentAnnouncement)}
        >
          {currentAnnouncement.isPinned && (
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '24px',
              }}
            >
              📌
            </motion.div>
          )}

          {currentAnnouncement.priority >= AnnouncementPriority.HIGH && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: priorityColors[currentAnnouncement.priority],
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              {priorityLabels[currentAnnouncement.priority]}优先级
            </motion.div>
          )}

          <h2
            style={{
              fontSize: '24px',
              marginBottom: '16px',
              color: '#333',
              paddingRight: currentAnnouncement.isPinned ? '40px' : '0',
              paddingLeft: currentAnnouncement.priority >= AnnouncementPriority.HIGH ? '80px' : '0',
            }}
          >
            {currentAnnouncement.title}
          </h2>

          <p
            style={{
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '20px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {currentAnnouncement.content}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              color: '#999',
            }}
          >
            <span>
              👁 {currentAnnouncement.viewCount} 次浏览
              {currentAnnouncement.isRead && ' ✓ 已读'}
            </span>
            <span>
              {currentAnnouncement.publishedAt
                ? new Date(currentAnnouncement.publishedAt).toLocaleDateString('zh-CN')
                : ''}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div
        style={{
          height: '4px',
          background: '#e0e0e0',
          borderRadius: '2px',
          marginTop: '20px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            borderRadius: '2px',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '20px',
        }}
      >
        {visibleAnnouncements.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
              setProgress(0);
            }}
            style={{
              width: index === currentIndex ? '32px' : '12px',
              height: '12px',
              borderRadius: '6px',
              border: 'none',
              background:
                index === currentIndex
                  ? 'linear-gradient(90deg, #667eea, #764ba2)'
                  : '#ddd',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrentIndex(
            (prev) => (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length,
          );
          setProgress(0);
        }}
        style={{
          position: 'absolute',
          left: '-50px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ‹
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        style={{
          position: 'absolute',
          right: '-50px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ›
      </button>
    </div>
  );
};
