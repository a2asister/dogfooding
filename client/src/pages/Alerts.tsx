import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Select, message, Card, Checkbox, Tooltip, Empty, Modal } from 'antd';
import { BellOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { alertApi } from '@/api';
import type { Alert } from '@/types';
import dayjs from 'dayjs';

function AlertsPage(): JSX.Element {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [read, setRead] = useState<string>('unread');
  const [level, setLevel] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchData = async (): Promise<void> => {
    try {
      const params: Record<string, unknown> = {
        page: 1,
        pageSize: 100,
      };
      if (read === 'unread') params.read = false;
      else if (read === 'read') params.read = true;
      if (level) params.level = level;

      const result = await alertApi.list(params);
      setAlerts(result.alerts as Alert[]);
      setUnreadCount(result.unreadCount as number);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [read, level]);

  const handleMarkRead = async (ids: string[]): Promise<void> => {
    try {
      await alertApi.markRead(ids);
      message.success('已标记为已读');
      fetchData();
      setSelectedRowKeys([]);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async (): Promise<void> => {
    Modal.confirm({
      title: '确认操作',
      content: '确认将所有告警标记为已读吗？',
      onOk: async () => {
        await alertApi.markAllRead();
        message.success('所有告警已标记为已读');
        fetchData();
      },
    });
  };

  const handleDelete = (id: string): void => {
    Modal.confirm({
      title: '确认删除',
      content: '确认删除此告警吗？',
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        await alertApi.delete(id);
        message.success('删除成功');
        fetchData();
      },
    });
  };

  const getLevelIcon = (l: string): JSX.Element => {
    const map: Record<string, JSX.Element> = {
      info: <BellOutlined style={{ color: '#1890ff' }} />,
      warning: <WarningOutlined style={{ color: '#faad14' }} />,
      error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      critical: <ExclamationCircleOutlined style={{ color: '#cf1322' }} />,
    };
    return map[l] || <BellOutlined />;
  };

  const getLevelTag = (l: string): JSX.Element => {
    const map: Record<string, { color: string; text: string }> = {
      info: { color: 'blue', text: '信息' },
      warning: { color: 'orange', text: '警告' },
      error: { color: 'red', text: '错误' },
      critical: { color: 'volcano', text: '严重' },
    };
    const t = map[l] || { color: 'default', text: l };
    return <Tag color={t.color}>{t.text}</Tag>;
  };

  const getTypeTag = (type: string): JSX.Element => {
    const map: Record<string, { color: string; text: string }> = {
      pipeline_failed: { color: 'red', text: '流水线失败' },
      auth_expired: { color: 'orange', text: '授权过期' },
      deployment_failed: { color: 'red', text: '部署失败' },
      security: { color: 'volcano', text: '安全告警' },
      system: { color: 'blue', text: '系统通知' },
    };
    const t = map[type] || { color: 'default', text: type };
    return <Tag color={t.color}>{t.text}</Tag>;
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const columns = [
    {
      title: '状态',
      dataIndex: 'read',
      key: 'read',
      width: 60,
      render: (isRead: boolean) => (
        <Tooltip title={isRead ? '已读' : '未读'}>
          {isRead ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <BellOutlined style={{ color: '#1890ff' }} />
          )}
        </Tooltip>
      ),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (l: string) => (
        <Space>
          {getLevelIcon(l)}
          {getLevelTag(l)}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => getTypeTag(type),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Alert) => (
        <Space direction="vertical" size={0}>
          <strong style={record.read ? { color: '#888' } : {}}>{text}</strong>
          <span style={{ color: '#888', fontSize: 12 }}>{record.message}</span>
        </Space>
      ),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: Alert) => (
        <Space>
          {!record.read && (
            <Button type="link" onClick={() => handleMarkRead([record.id])}>
              标记已读
            </Button>
          )}
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Space wrap>
          <Select
            value={read}
            onChange={setRead}
            style={{ width: 140 }}
            options={[
              { value: 'unread', label: `未读 (${unreadCount})` },
              { value: 'read', label: '已读' },
              { value: 'all', label: '全部' },
            ]}
          />
          <Select
            placeholder="告警级别"
            value={level || undefined}
            onChange={setLevel}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value="info">信息</Select.Option>
            <Select.Option value="warning">警告</Select.Option>
            <Select.Option value="error">错误</Select.Option>
            <Select.Option value="critical">严重</Select.Option>
          </Select>
        </Space>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Button onClick={() => handleMarkRead(selectedRowKeys as string[])}>
              标记选中已读 ({selectedRowKeys.length})
            </Button>
          )}
          <Button onClick={handleMarkAllRead}>全部标记已读</Button>
        </Space>
      </div>

      {alerts.length === 0 && !loading ? (
        <Empty description="暂无告警" />
      ) : (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={alerts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条告警` }}
        />
      )}
    </Card>
  );
}

export default AlertsPage;
