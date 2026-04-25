import { useState, useEffect } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Select, DatePicker, Input } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useCommonStore } from '../../stores/commonStore';
import type { ColumnsType } from 'antd/es/table';
import type { OperationLog, UserRole } from '../../types';
import { roleDescriptions } from '../../stores/authStore';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const roleColors: Record<UserRole, string> = {
  admin: 'purple',
  medical: 'green',
  charge: 'orange',
  patient: 'blue',
};

export default function OperationLogs() {
  const { operationLogs, loadOperationLogs } = useCommonStore();
  const [loading, setLoading] = useState(false);
  const [filteredLogs, setFilteredLogs] = useState<OperationLog[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterModule, setFilterModule] = useState<string>('');

  useEffect(() => {
    loadOperationLogs();
  }, [loadOperationLogs]);

  useEffect(() => {
    let result = [...operationLogs];

    if (searchText) {
      result = result.filter(
        (log) =>
          log.userName.includes(searchText) ||
          log.module.includes(searchText) ||
          log.action.includes(searchText) ||
          (log.details && log.details.includes(searchText))
      );
    }

    if (filterRole) {
      result = result.filter((log) => log.userRole === filterRole);
    }

    if (filterModule) {
      result = result.filter((log) => log.module === filterModule);
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredLogs(result);
  }, [operationLogs, searchText, filterRole, filterModule]);

  const modules = [...new Set(operationLogs.map((log) => log.module))];

  const columns: ColumnsType<OperationLog> = [
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '操作用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 180,
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <span>{name}</span>
          <Tag color={roleColors[record.userRole]}>{roleDescriptions[record.userRole]}</Tag>
        </div>
      ),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (module) => <Tag>{module}</Tag>,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 100,
    },
    {
      title: '目标类型',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 100,
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      render: (details) => details || '-',
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    loadOperationLogs();
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          操作日志
        </Title>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
          刷新
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索用户名、模块、操作或详情"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="筛选角色"
            style={{ width: 150 }}
            allowClear
            value={filterRole || undefined}
            onChange={(value) => setFilterRole(value)}
          >
            <Select.Option value="admin">医院管理员</Select.Option>
            <Select.Option value="medical">医护医技</Select.Option>
            <Select.Option value="charge">收费后勤</Select.Option>
            <Select.Option value="patient">就诊患者</Select.Option>
          </Select>
          <Select
            placeholder="筛选模块"
            style={{ width: 150 }}
            allowClear
            value={filterModule || undefined}
            onChange={(value) => setFilterModule(value)}
          >
            {modules.map((module) => (
              <Select.Option key={module} value={module}>
                {module}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          size="middle"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSize: 20,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
