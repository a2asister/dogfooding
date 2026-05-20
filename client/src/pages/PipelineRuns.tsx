import { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Card, Spin, Modal, message } from 'antd';
import { PlayCircleOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { pipelineApi } from '@/api';
import type { PipelineRun } from '@/types';
import dayjs from 'dayjs';

function PipelineRuns(): JSX.Element {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchRuns = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await pipelineApi.listRuns({ page, pageSize });
      setRuns(result.runs as PipelineRun[]);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [page, pageSize]);

  const handleCancel = (id: string): void => {
    Modal.confirm({
      title: '取消运行',
      content: '确认取消此流水线运行吗？',
      onOk: async () => {
        await pipelineApi.cancelRun(id);
        message.success('已取消');
        fetchRuns();
      },
    });
  };

  const getStatusTag = (status: string): JSX.Element => {
    const map: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: '等待中' },
      running: { color: 'processing', text: '运行中' },
      success: { color: 'success', text: '成功' },
      failed: { color: 'error', text: '失败' },
      cancelled: { color: 'warning', text: '已取消' },
    };
    const s = map[status];
    return s ? <Tag color={s.color}>{s.text}</Tag> : <Tag>{status}</Tag>;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: '分支',
      dataIndex: 'branch',
      key: 'branch',
      width: 120,
      render: (branch: string) => <Tag color="blue">{branch}</Tag>,
    },
    {
      title: 'Commit',
      dataIndex: 'commitSha',
      key: 'commitSha',
      width: 120,
      render: (sha: string) => sha.substring(0, 8),
    },
    {
      title: '提交信息',
      dataIndex: 'commitMessage',
      key: 'commitMessage',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 100,
    },
    {
      title: '触发者',
      dataIndex: 'triggeredBy',
      key: 'triggeredBy',
      width: 120,
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration?: number) => (duration ? `${(duration / 1000).toFixed(1)}s` : '-'),
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 180,
      render: (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: PipelineRun) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/pipeline-runs/${record.id}`)}>
            查看日志
          </Button>
          {record.status === 'running' && (
            <Button type="link" danger icon={<StopOutlined />} onClick={() => handleCancel(record.id)}>
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>流水线运行记录</h3>
        <Button icon={<ReloadOutlined />} onClick={fetchRuns}>
          刷新
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={runs}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showTotal: (t) => `共 ${t} 条记录`,
          onChange: setPage,
        }}
      />
    </Card>
  );
}

export default PipelineRuns;
