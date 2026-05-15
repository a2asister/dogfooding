import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Announcement, AnnouncementPriority } from '../types';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

const priorityColors: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.LOW]: '#4caf50',
  [AnnouncementPriority.MEDIUM]: '#ff9800',
  [AnnouncementPriority.HIGH]: '#f44336',
  [AnnouncementPriority.URGENT]: '#e91e63',
};

const priorityLabels: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.LOW]: '低优先级',
  [AnnouncementPriority.MEDIUM]: '中优先级',
  [AnnouncementPriority.HIGH]: '高优先级',
  [AnnouncementPriority.URGENT]: '紧急',
};

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  announcement,
}) => {
  if (!announcement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              width: '90%',
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 40px)',
              minHeight: 'auto',
              background: 'white',
              borderRadius: '16px',
              padding: '24px 30px 30px 30px',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                {announcement.isPinned && (
                  <motion.span
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    style={{ fontSize: '20px' }}
                  >
                    📌
                  </motion.span>
                )}
                <span
                  style={{
                    background: priorityColors[announcement.priority],
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {priorityLabels[announcement.priority]}
                </span>
                {announcement.isRead && (
                  <span
                    style={{
                      background: '#4caf50',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                    }}
                  >
                    已读
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '28px', color: '#333', margin: 0 }}>
                {announcement.title}
              </h2>
            </div>

            <div
              style={{
                padding: '20px',
                background: '#f9f9f9',
                borderRadius: '12px',
                marginBottom: '20px',
                lineHeight: '1.8',
                color: '#444',
                fontSize: '16px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {announcement.content}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '14px',
                color: '#888',
              }}
            >
              <span>👁 浏览次数: {announcement.viewCount}</span>
              {announcement.publishedAt && (
                <span>
                  📅 发布时间: {new Date(announcement.publishedAt).toLocaleString('zh-CN')}
                </span>
              )}
              {announcement.expireAt && (
                <span>
                  ⏰ 失效时间: {new Date(announcement.expireAt).toLocaleString('zh-CN')}
                </span>
              )}
              {announcement.publishedBy && <span>👤 发布人: {announcement.publishedBy}</span>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
