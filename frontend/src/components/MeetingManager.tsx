import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MEETINGS, CREATE_MEETING, UPDATE_MEETING, DELETE_MEETING } from '../graphql/queries';

interface Meeting {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface MeetingManagerProps {
  onSelectMeeting: (meeting: Meeting) => void;
}

const MeetingManager: React.FC<MeetingManagerProps> = ({ onSelectMeeting }) => {
  const { loading, error, data, refetch } = useQuery(GET_MEETINGS);
  const [createMeeting] = useMutation(CREATE_MEETING);
  const [updateMeeting] = useMutation(UPDATE_MEETING);
  const [deleteMeeting] = useMutation(DELETE_MEETING);

  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const variables = {
      input: {
        title: formData.title,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      },
    };

    if (editingMeeting) {
      await updateMeeting({
        variables: {
          input: {
            id: editingMeeting.id,
            ...variables.input,
          },
        },
      });
    } else {
      await createMeeting({ variables });
    }

    refetch();
    setShowForm(false);
    setEditingMeeting(null);
    setFormData({ title: '', startTime: '', endTime: '' });
  };

  const formatDateTimeForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      startTime: formatDateTimeForInput(meeting.startTime),
      endTime: formatDateTimeForInput(meeting.endTime),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    await deleteMeeting({ variables: { id } });
    refetch();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>会议日程管理</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          添加会议
        </button>
      </div>

      {showForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <form
          onSubmit={handleSubmit}
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
          }}
        >
          <h2 style={{ marginBottom: '1.5rem' }}>
            {editingMeeting ? '编辑会议' : '添加会议'}
          </h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>会议标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>开始时间</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>结束时间</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingMeeting(null);
                setFormData({ title: '', startTime: '', endTime: '' });
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#ddd',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              保存
            </button>
          </div>
        </form>
      </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data?.meetings?.map((meeting: Meeting) => (
          <div
            key={meeting.id}
            style={{
              padding: '1.5rem',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>{meeting.title}</h3>
              <p style={{ color: '#666', marginBottom: '0.25rem' }}>
                开始: {new Date(meeting.startTime).toLocaleString('zh-CN')}
              </p>
              <p style={{ color: '#666' }}>
                结束: {new Date(meeting.endTime).toLocaleString('zh-CN')}
              </p>
              <div style={{ marginTop: '0.5rem' }}>
                {meeting.isActive && (
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: '#2ecc71',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                    }}
                  >
                    进行中
                  </span>
                )}
                {meeting.isCompleted && (
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: '#95a5a6',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                    }}
                  >
                    已结束
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onSelectMeeting(meeting)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                查看倒计时
              </button>
              <button
                onClick={() => handleEdit(meeting)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(meeting.id)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {data?.meetings?.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
          暂无会议日程，请点击上方按钮添加
        </div>
      )}
    </div>
  );
};

export default MeetingManager;
