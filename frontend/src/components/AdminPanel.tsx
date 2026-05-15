import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Announcement, AnnouncementStatus, AnnouncementPriority } from '../types';

interface AdminPanelProps {
  announcements: Announcement[];
  onRefresh: () => void;
  onCreate: (data: Partial<Announcement>) => Promise<void>;
  onUpdate: (id: number, data: Partial<Announcement>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onBatchDelete: (ids: number[]) => Promise<void>;
  onBatchUpdate: (data: { ids: number[]; status?: string; isPinned?: boolean }) => Promise<void>;
}

const statusColors: Record<string, string> = {
  draft: '#9e9e9e',
  published: '#4caf50',
  expired: '#f44336',
};

const statusLabels: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  expired: '已失效',
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  announcements,
  onRefresh,
  onCreate,
  onUpdate,
  onDelete,
  onBatchDelete,
  onBatchUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: AnnouncementStatus.DRAFT,
    priority: AnnouncementPriority.MEDIUM,
    isPinned: false,
    expireAt: '',
    publishedBy: '',
  });

  const formatDateTimeForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const openModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        status: announcement.status,
        priority: announcement.priority,
        isPinned: announcement.isPinned,
        expireAt: formatDateTimeForInput(announcement.expireAt),
        publishedBy: announcement.publishedBy || '',
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        status: AnnouncementStatus.DRAFT,
        priority: AnnouncementPriority.MEDIUM,
        isPinned: false,
        expireAt: '',
        publishedBy: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await onUpdate(editingAnnouncement.id, formData);
      } else {
        await onCreate(formData);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === announcements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(announcements.map((a) => a.id));
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '24px', color: '#333', margin: 0 }}>公告管理</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={() =>
                  onBatchUpdate({ ids: selectedIds, status: AnnouncementStatus.PUBLISHED })
                    .then(onRefresh)
                    .then(() => setSelectedIds([]))
                }
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#4caf50',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                批量发布 ({selectedIds.length})
              </button>
              <button
                onClick={() =>
                  onBatchDelete(selectedIds).then(onRefresh).then(() => setSelectedIds([]))
                }
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#f44336',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                批量删除 ({selectedIds.length})
              </button>
            </>
          )}
          <button
            onClick={() => openModal()}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            + 新建公告
          </button>
          <button
            onClick={onRefresh}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            刷新
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === announcements.length && announcements.length > 0}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>标题</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>状态</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>优先级</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>置顶</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>浏览次数</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>创建时间</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <motion.tr
                key={announcement.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ borderBottom: '1px solid #eee' }}
              >
                <td style={{ padding: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(announcement.id)}
                    onChange={() => handleSelect(announcement.id)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '12px', maxWidth: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {announcement.isPinned && <span>📌</span>}
                    <span style={{ fontWeight: 500 }}>{announcement.title}</span>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span
                    style={{
                      background: statusColors[announcement.status],
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                    }}
                  >
                    {statusLabels[announcement.status]}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {announcement.priority === AnnouncementPriority.URGENT
                    ? '🔴 紧急'
                    : announcement.priority === AnnouncementPriority.HIGH
                    ? '🟠 高'
                    : announcement.priority === AnnouncementPriority.MEDIUM
                    ? '🟡 中'
                    : '🟢 低'}
                </td>
                <td style={{ padding: '12px' }}>{announcement.isPinned ? '是' : '否'}</td>
                <td style={{ padding: '12px' }}>{announcement.viewCount}</td>
                <td style={{ padding: '12px' }}>
                  {new Date(announcement.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openModal(announcement)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #2196f3',
                        background: 'white',
                        color: '#2196f3',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onDelete(announcement.id).then(onRefresh)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #f44336',
                        background: 'white',
                        color: '#f44336',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
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
              onClick={() => setIsModalOpen(false)}
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
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
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
            >
              <h3 style={{ fontSize: '24px', margin: '0 0 20px 0', color: '#333', flexShrink: 0 }}>
                {editingAnnouncement ? '编辑公告' : '新建公告'}
              </h3>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  flex: 1,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: '8px',
                    marginRight: '-8px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        标题
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                        内容
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          minHeight: '120px',
                          resize: 'vertical',
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                          状态
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value as AnnouncementStatus })
                          }
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                          }}
                        >
                          <option value={AnnouncementStatus.DRAFT}>草稿</option>
                          <option value={AnnouncementStatus.PUBLISHED}>已发布</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                          优先级
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({ ...formData, priority: Number(e.target.value) as AnnouncementPriority })
                          }
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                          }}
                        >
                          <option value={AnnouncementPriority.LOW}>低</option>
                          <option value={AnnouncementPriority.MEDIUM}>中</option>
                          <option value={AnnouncementPriority.HIGH}>高</option>
                          <option value={AnnouncementPriority.URGENT}>紧急</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                          失效时间
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.expireAt}
                          onChange={(e) => setFormData({ ...formData, expireAt: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                          发布人
                        </label>
                        <input
                          type="text"
                          value={formData.publishedBy}
                          onChange={(e) => setFormData({ ...formData, publishedBy: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        id="isPinned"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="isPinned" style={{ cursor: 'pointer' }}>
                        置顶公告
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #eee', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    保存
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
