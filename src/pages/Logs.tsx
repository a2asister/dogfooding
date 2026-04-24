import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Descriptions,
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
  Space,
  message,
} from 'antd';
import {
  SearchOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { OperationLog, User } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Logs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [filters, setFilters] = useState({
    userId: undefined as string | undefined,
    action: undefined as string | undefined,
    module: undefined as string | undefined,
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
    keyword: '',
  });

  const { isAdmin } = useAuth();

  const loadData = () => {
    if (!isAdmin) {
      message.error('权限不足，无法访问操作日志');
      return;
    }
    setLoading(true);
    try {
      setLogs(storage.getLogs());
      setUsers(storage.getUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    loadData();
  }, [isAdmin]);

  const getFilteredLogs = () => {
    return logs.filter((log) => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.module && log.module !== filters.module) return false;
      if (filters.dateRange) {
        const logDate = dayjs(log.createdAt);
        if (logDate.isBefore(filters.dateRange[0]) || logDate.isAfter(filters.dateRange[1])) return false;
      }
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        if (
          !log.description?.toLowerCase().includes(keyword) &&
          !log.module?.toLowerCase().includes(keyword) &&
          !log.action?.toLowerCase().includes(keyword)
        ) return false;
      }
      return true;
    });
  };

  const handleViewDetail = (record: OperationLog) => {
    if (!isAdmin) {
      message.error('权限不足，无法查看日志详情');
      return;
    }
    setSelectedLog(record);
    setIsDetailOpen(true);
  };

  const getAllActions = () => {
    const actions = new Set<string>();
    logs.forEach((log) => actions.add(log.action));
    return Array.from(actions);
  };

  const getAllModules = () => {
    const modules = new Set<string>();
    logs.forEach((log) => modules.add(log.module));
    return Array.from(modules);
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || userId;
  };

  const getActionColor = (action: string) => {
    const colorMap: Record<string, string> = {
      '登录': 'green',
      '登出': 'default',
      '新增': 'blue',
      '编辑': 'orange',
      '删除': 'red',
      '禁用': 'red',
      '启用': 'green',
    };
    return colorMap[action] || 'default';
  };

  const columns = [
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作用户',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      render: (userId: string) => getUserName(userId),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (module: string) => (
        <Tag color="blue">{module}</Tag>
      ),
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action}</Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: OperationLog) => (
        <Button
          type="link"
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  const filteredLogs = getFilteredLogs();

  return (
    <div className="logs-page">
      <Card title="操作日志">
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              placeholder="操作用户"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => setFilters({ ...filters, userId: value })}
            >
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="操作类型"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, action: value })}
            >
              {getAllActions().map((action) => (
                <Option key={action} value={action}>
                  {action}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="模块"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, module: value })}
            >
              {getAllModules().map((module) => (
                <Option key={module} value={module}>
                  {module}
                </Option>
              ))}
            </Select>
            <RangePicker
              style={{ width: 250 }}
              onChange={(dates) =>
                setFilters({
                  ...filters,
                  dateRange: dates ? [dates[0]!, dates[1]!] : undefined,
                })
              }
            />
            <Input.Search
              placeholder="搜索描述"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onSearch={(value) => setFilters({ ...filters, keyword: value })}
              allowClear
            />
          </Space>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `共 ${total} 条日志`,
          }}
        />
      </Card>

      <Modal
        title="日志详情"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedLog && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="操作时间">
              {new Date(selectedLog.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="操作用户">
              {getUserName(selectedLog.userId)}
            </Descriptions.Item>
            <Descriptions.Item label="模块">
              <Tag color="blue">{selectedLog.module}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="操作类型">
              <Tag color={getActionColor(selectedLog.action)}>{selectedLog.action}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="描述">
              {selectedLog.description}
            </Descriptions.Item>
            <Descriptions.Item label="详细信息">
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Logs;
