import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Select, Input, message, Card, Avatar, Badge } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { prApi, repositoryApi } from '@/api';
import type { PullRequest, Repository } from '@/types';
import dayjs from 'dayjs';

function PullRequests(): JSX.Element {
  const navigate = useNavigate();
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<string>('open');
  const [repoId, setRepoId] = useState<string>('');
  const [searchText, setSearchText] = useState('');

  const fetchData = async (): Promise<void> => {
    try {
      const [prResult, repoResult] = await Promise.all([
        prApi.list({ page: 1, pageSize: 100, state, repoId: repoId || undefined }),
        repositoryApi.list(),
      ]);
      setPrs(prResult.prs as PullRequest[]);
      setRepos(repoResult.repos as Repository[]);
    } catch {
      setPrs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [state, repoId]);

  const getStateTag = (prState: string): JSX.Element => {
    const map: Record<string, { color: string; text: string; icon: JSX.Element }> = {
      open: { color: 'green', text: '开放', icon: <ClockCircleOutlined /> },
      closed: { color: 'red', text: '关闭', icon: <CloseCircleOutlined /> },
      merged: { color: 'purple', text: '已合并', icon: <CheckCircleOutlined /> },
    };
    const t = map[prState] || map.open;
    return (
      <Tag color={t.color}>
        <Space size={4}>
          {t.icon}
          {t.text}
        </Space>
      </Tag>
    );
  };

  const getCiStatusBadge = (status: string): JSX.Element => {
    const map: Record<string, { status: 'success' | 'processing' | 'error' | 'warning' | 'default'; text: string }> = {
      success: { status: 'success', text: '通过' },
      failed: { status: 'error', text: '失败' },
      pending: { status: 'processing', text: '进行中' },
      skipped: { status: 'default', text: '跳过' },
    };
    const t = map[status] || map.pending;
    return <Badge status={t.status} text={t.text} />;
  };

  const filteredPrs = prs.filter((pr) =>
    pr.title.toLowerCase().includes(searchText.toLowerCase()) ||
    pr.number.toString().includes(searchText)
  );

  const columns = [
    {
      title: 'PR',
      key: 'pr',
      render: (_: unknown, record: PullRequest) => (
        <Space direction="vertical" size={0}>
          <Button
            type="link"
            style={{ padding: 0, height: 'auto' }}
            onClick={() => navigate(`/pull-requests/${record.id}`)}
          >
            <strong>#{record.number} {record.title}</strong>
          </Button>
          <div style={{ color: '#888', fontSize: 12 }}>
            {record.headBranch} → {record.baseBranch}
          </div>
        </Space>
      ),
    },
    {
      title: '仓库',
      dataIndex: 'repoId',
      key: 'repoId',
      width: 200,
      render: (id: string) => {
        const repo = repos.find((r) => r.id === id);
        return repo?.fullName || '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (s: string) => getStateTag(s),
    },
    {
      title: 'CI 状态',
      dataIndex: 'ciStatus',
      key: 'ciStatus',
      width: 100,
      render: (status: string) => getCiStatusBadge(status),
    },
    {
      title: '审批',
      dataIndex: 'approvals',
      key: 'approvals',
      width: 120,
      render: (approvals: string[]) => (
        <Tag color={approvals.length > 0 ? 'green' : 'default'}>
          {approvals.length} 人已批准
        </Tag>
      ),
    },
    {
      title: '作者',
      key: 'author',
      width: 160,
      render: (_: unknown, record: PullRequest) => (
        <Space>
          <Avatar size={24} src={record.authorAvatar}>
            {record.author?.[0]?.toUpperCase()}
          </Avatar>
          <span>{record.author}</span>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Select
          value={state}
          onChange={setState}
          style={{ width: 140 }}
          options={[
            { value: 'open', label: '开放' },
            { value: 'merged', label: '已合并' },
            { value: 'closed', label: '关闭' },
            { value: '', label: '全部' },
          ]}
        />
        <Select
          placeholder="选择仓库"
          value={repoId || undefined}
          onChange={setRepoId}
          style={{ width: 220 }}
          allowClear
        >
          {repos.map((repo) => (
            <Select.Option key={repo.id} value={repo.id}>
              {repo.fullName}
            </Select.Option>
          ))}
        </Select>
        <Input
          placeholder="搜索 PR 标题或编号"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 280 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredPrs}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 个 PR` }}
      />
    </Card>
  );
}

export default PullRequests;
