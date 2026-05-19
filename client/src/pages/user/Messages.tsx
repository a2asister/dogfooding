import { useState, useEffect } from 'react';
import { List, Tag, Button, Empty, Card } from 'antd';
import { MessageOutlined, BellOutlined, ShoppingOutlined, RiseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { messageApi } from '../../services/api';
import { Message } from '../../types';

const typeIconMap: Record<string, JSX.Element> = {
  system: <BellOutlined style={{ color: '#1890ff' }} />,
  order: <ShoppingOutlined style={{ color: '#52c41a' }} />,
  auction: <RiseOutlined style={{ color: '#faad14' }} />,
  sms: <MessageOutlined style={{ color: '#722ed1' }} />
};

const typeLabelMap: Record<string, { color: string; text: string }> = {
  system: { color: 'blue', text: '系统消息' },
  order: { color: 'green', text: '订单消息' },
  auction: { color: 'orange', text: '竞拍消息' },
  sms: { color: 'purple', text: '短信通知' }
};

function Messages(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await messageApi.getList() as unknown as { messages: Message[]; total: number; unreadCount: number };
      setMessages(res.messages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkRead = async (id: number): Promise<void> => {
    try {
      await messageApi.markRead(id);
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, isRead: true } : msg
      ));
    } catch {
      // Error handled
    }
  };

  const handleMarkAllRead = async (): Promise<void> => {
    try {
      await messageApi.markAllRead();
      setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
    } catch {
      // Error handled
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title" style={{ margin: 0 }}>消息中心</h2>
        <Button onClick={handleMarkAllRead}>全部标记已读</Button>
      </div>

      <Card>
        {messages.length === 0 && !loading ? (
          <Empty description="暂无消息" />
        ) : (
          <List
            dataSource={messages}
            loading={loading}
            renderItem={(item) => (
              <List.Item
                style={{ 
                  background: item.isRead ? 'transparent' : '#f0f8ff',
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: 16
                }}
                onClick={() => !item.isRead && handleMarkRead(item.id)}
              >
                <List.Item.Meta
                  avatar={<div style={{ fontSize: 24 }}>{typeIconMap[item.type]}</div>}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        {(() => {
                          const labelInfo = typeLabelMap[item.type];
                          return labelInfo ? (
                            <Tag color={labelInfo.color} style={{ marginRight: 8 }}>
                              {labelInfo.text}
                            </Tag>
                          ) : null;
                        })()}
                        <span style={{ fontWeight: 500 }}>{item.title}</span>
                        {!item.isRead && <span style={{ color: '#ff4d4f', marginLeft: 8 }}>●</span>}
                      </div>
                      <span style={{ color: '#999', fontSize: 12 }}>
                        {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </div>
                  }
                  description={item.content}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

export default Messages;
