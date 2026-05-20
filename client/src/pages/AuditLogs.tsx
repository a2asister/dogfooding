import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Select, Input, DatePicker, message, Card } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { auditApi } from '@/api';
import type { AuditLog } from '@/types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

function AuditLogs(): JSX.Element {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [userId, setUserId] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [module, setModule] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [searchText, setSearchText] = useState('');

  const modules = ['auth', 'github', 'repository', 'pipeline', 'deployment', 'branch', 'pr', 'user', 'alert', 'system'];
  const actions = ['create', 'update', 'delete', 'login', 'logout', 'sync', 'run', 'deploy', 'rollback', 'approve', 'reject', 'export'];

  const fetchData = async (): Promise<void> => {
    try {
      const params: Record<string, unknown> = {
        page,
        pageSize,
      };
      if (userId) params.userId = userId;
      if (action) params.action = action;
      if (module) params.module = module;
      if (dateRange && dateRange[0]) params.startTime = dateRange[0].valueOf();
      if (dateRange && dateRange[1]) params.endTime = dateRange[1].valueOf();

      const result = await auditApi.list(params);
      setLogs(result.logs as AuditLog[]);
      setTotal(result.total as number);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, userId, action, module, dateRange]);

  const handleExport = async (): Promise<void> => {
    try {
      const params: Record<string, unknown> = {};
      if (userId) params.userId = userId;
      if (action) params.action = action;
      if (module) params.module = module;
      if (dateRange && dateRange[0]) params.startTime = dateRange[0].valueOf();
      if (dateRange && dateRange[1]) params.endTime = dateRange[1].valueOf();

      const blob = await auditApi.export(params);
      const url = window.URL.createObjectURL(blob as unknown as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  const getModuleTag = (m: string): JSX.Element => {
    const colorMap: Record<string, string> = {
      auth: 'red',
      github: 'geekblue',
      repository: 'blue',
      pipeline: 'cyan',
      deployment: 'green',
      branch: 'purple',
      pr: 'orange',
      user: 'gold',
      alert: 'volcano',
      system: 'default',
    };
    return <Tag color={colorMap[m] || 'default'}>{m}</Tag>;
  };

  const getActionTag = (a: string): JSX.Element => {
    const colorMap: Record<string, string> = {
      create: 'green',
      update: 'blue',
      delete: 'red',
      login: 'cyan',
      logout: 'default',
      sync: 'purple',
      run: 'geekblue',
      deploy: 'orange',
      rollback: 'volcano',
      approve: 'green',
      reject: 'red',
      export: 'gold',
    };
    return <Tag color={colorMap[a] || 'default'}>{a}</Tag>;
  };

  const filteredLogs = logs.filter((log) =>
    searchText === '' ||
    log.username.toLowerCase().includes(searchText.toLowerCase()) ||
    log.action.toLowerCase().includes(searchText.toLowerCase()) ||
    log.module.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (m: string) => getModuleTag(m),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (a: string) => getActionTag(a),
    },
    {
      title: '目标ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 140,
      render: (id: string) => id || '-',
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      render: (details: Record<string, unknown>) => (
        <code style={{ fontSize: 12 }}>{JSON.stringify(details)}</code>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
      render: (ip: string) => ip || '-',
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Space wrap>
          <Select
            placeholder="模块"
            value={module || undefined}
            onChange={setModule}
            style={{ width: 140 }}
            allowClear
          >
            {modules.map((m) => (
              <Select.Option key={m} value={m}>
                {m}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="操作"
            value={action || undefined}
            onChange={setAction}
            style={{ width: 140 }}
            allowClear
          >
            {actions.map((a) => (
              <Select.Option key={a} value={a}>
                {a}
              </Select.Option>
            ))}
          </Select>
          <RangePicker
            showTime
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
            style={{ width: 360 }}
          />
          <Input
            placeholder="搜索用户、模块、操作"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
          />
        </Space>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          导出 CSV
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredLogs}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showTotal: (t) => `共 ${t} 条记录`,
          onChange: setPage,
        }}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
}

export default AuditLogs;
