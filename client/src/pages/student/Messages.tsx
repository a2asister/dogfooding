import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Select, Empty, Button, Badge, Modal } from 'antd';
import { MessageOutlined, BellOutlined, MailOutlined } from '@ant-design/icons';
import { studentApi } from '../../api';
import { Message } from '../../types';

const { Option } = Select;

const Messages: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [type, setType] = useState<string>('');
  const [isRead, setIsRead] = useState<string>('');
  const [detailModal, setDetailModal] = useState<{ visible: boolean; message: Message | null }>({
    visible: false,
    message: null,
  });

  useEffect(() => {
    loadMessages();
  }, [type, isRead]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getMessages({
        type: type || undefined,
        isRead: isRead || undefined,
      });
      setMessages(data || []);
    } catch (error) {
      console.error('加载消息失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (msg: Message) => {
    if (msg.isRead === 0) {
      try {
        await studentApi.readMessage(msg.id);
        setMessages(messages.map((m) => (m.id === msg.id ? { ...m, isRead: 1 } : m)));
      } catch (error) {
        console.error('标记已读失败', error);
      }
    }
    setDetailModal({ visible: true, message: msg });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <BellOutlined style={{ color: '#1890ff' }} />;
      case 'personal':
        return <MailOutlined style={{ color: '#52c41a' }} />;
      default:
        return <MessageOutlined />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'system':
        return '系统通知';
      case 'personal':
        return '个人消息';
      default:
        return type;
    }
  };

  const unreadCount = messages.filter((m) => m.isRead === 0).length;

  return (
    <div>
      <Card
        className="card-shadow"
        title={<><MessageOutlined /> 消息中心</>}
        extra={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Badge count={unreadCount} offset={[-5, 3]}>
              <Tag color="red">未读 {unreadCount} 条</Tag>
            </Badge>
            <span>类型：</span>
            <Select
              placeholder="全部"
              allowClear
              style={{ width: 120 }}
              value={type || undefined}
              onChange={(value) => setType(value || '')}
            >
              <Option value="system">系统通知</Option>
              <Option value="personal">个人消息</Option>
            </Select>
            <span>状态：</span>
            <Select
              placeholder="全部"
              allowClear
              style={{ width: 120 }}
              value={isRead || undefined}
              onChange={(value) => setIsRead(value || '')}
            >
              <Option value="0">未读</Option>
              <Option value="1">已读</Option>
            </Select>
            <Button onClick={loadMessages}>刷新</Button>
          </div>
        }
      >
        {messages.length === 0 ? (
          <Empty description="暂无消息" />
        ) : (
          <List
            loading={loading}
            dataSource={messages}
            renderItem={(item) => (
              <List.Item
                className="news-item"
                onClick={() => handleRead(item)}
                style={{
                  opacity: item.isRead === 0 ? 1 : 0.6,
                  background: item.isRead === 0 ? '#f0f8ff' : 'transparent',
                  padding: '15px 20px',
                }}
              >
                <List.Item.Meta
                  avatar={getTypeIcon(item.type)}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.isRead === 0 && <Tag color="red">新</Tag>}
                      <span style={{ fontWeight: item.isRead === 0 ? '600' : '400' }}>
                        {item.title}
                      </span>
                    </div>
                  }
                  description={
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
                      <Tag color={item.type === 'system' ? 'blue' : 'green'}>{getTypeLabel(item.type)}</Tag>
                      <span style={{ color: '#999', fontSize: '13px' }}>{item.createdAt}</span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title={detailModal.message?.title}
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, message: null })}
        footer={[
          <Button key="close" onClick={() => setDetailModal({ visible: false, message: null })}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        <div style={{ padding: '10px 0' }}>
          <div style={{ marginBottom: '15px', color: '#999', fontSize: '13px' }}>
            <Tag color={detailModal.message?.type === 'system' ? 'blue' : 'green'}>
              {getTypeLabel(detailModal.message?.type || '')}
            </Tag>
            {detailModal.message?.createdAt}
          </div>
          <div style={{ lineHeight: '2', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
            {detailModal.message?.content}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Messages;
