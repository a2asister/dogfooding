import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Tag, Descriptions, Table, message, Typography } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, EditOutlined } from '@ant-design/icons';
import { pipelineApi, repositoryApi } from '@/api';
import type { Pipeline, PipelineRun, Repository } from '@/types';
import dayjs from 'dayjs';

const { Text } = Typography;

function PipelineDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (): Promise<void> => {
    if (!id) return;
    try {
      const [pipelineResult, repoResult, runsResult] = await Promise.all([
        pipelineApi.get(id),
        repositoryApi.list(),
        pipelineApi.listRuns({ pipelineId: id, pageSize: 50 }),
      ]);
      setPipeline(pipelineResult.pipeline as Pipeline);
      setRepos(repoResult.repos as Repository[]);
      setRuns(runsResult.runs as PipelineRun[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRun = async (): Promise<void> => {
    if (!pipeline) return;
    try {
      await pipelineApi.run(pipeline.id, {
        repoId: pipeline.repoId,
        commitSha: 'abc123def456',
        commitMessage: '手动触发',
        branch: 'main',
      });
      message.success('流水线已启动');
      navigate(`/pipeline-runs`);
    } catch {
      // ignore
    }
  };

  const getStatusTag = (status: string): JSX.Element => {
    const map: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: '等待中' },
      running: { color: 'processing', text: '运行中' },
      success: { color: 'success', text: '成功' },
      failed: { color: 'error', text: '失败' },
      cancelled: { color: 'warning', text: '已取消' },
    };
    const t = map[status] || map.pending;
    return <Tag color={t.color}>{t.text}</Tag>;
  };

  const getTriggerTypeText = (type: string): string => {
    const map: Record<string, string> = {
      push: '代码推送',
      pull_request: 'PR提交',
      schedule: '定时触发',
      manual: '手动触发',
    };
    return map[type] || type;
  };

  const runColumns = [
    {
      title: '运行ID',
      dataIndex: 'id',
      key: 'id',
      render: (runId: string, record: PipelineRun) => (
        <Button
          type="link"
          onClick={() => navigate(`/pipeline-runs/${record.id}`)}
        >
          {runId.slice(0, 8)}...
        </Button>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '分支',
      dataIndex: 'branch',
      key: 'branch',
      width: 120,
    },
    {
      title: '触发者',
      dataIndex: 'triggeredBy',
      key: 'triggeredBy',
      width: 120,
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 180,
      render: (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration?: number) =>
        duration ? `${Math.round(duration / 1000)}s` : '-',
    },
  ];

  if (loading) {
    return <Card loading />;
  }

  if (!pipeline) {
    return <Card>流水线不存在</Card>;
  }

  const repo = repos.find((r) => r.id === pipeline.repoId);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleRun}>
            运行
          </Button>
          <Button icon={<EditOutlined />}>
            编辑
          </Button>
        </Space>
        <h2 style={{ margin: 0 }}>{pipeline.name}</h2>
      </Card>

      <Descriptions title="基本信息" bordered column={2}>
        <Descriptions.Item label="流水线名称">{pipeline.name}</Descriptions.Item>
        <Descriptions.Item label="仓库">{repo?.fullName || '-'}</Descriptions.Item>
        <Descriptions.Item label="触发方式">{getTriggerTypeText(pipeline.triggerType)}</Descriptions.Item>
        <Descriptions.Item label="语言">{pipeline.language}</Descriptions.Item>
        <Descriptions.Item label="部署环境">{pipeline.environment}</Descriptions.Item>
        <Descriptions.Item label="分支匹配">{pipeline.branchPattern || '所有分支'}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{dayjs(pipeline.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{dayjs(pipeline.updatedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
      </Descriptions>

      <Card title="构建脚本">
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
          <Text code style={{ color: '#d4d4d4' }}>{pipeline.buildScript}</Text>
        </pre>
      </Card>

      {pipeline.testScript && (
        <Card title="测试脚本">
          <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
            <Text code style={{ color: '#d4d4d4' }}>{pipeline.testScript}</Text>
          </pre>
        </Card>
      )}

      {pipeline.deployScript && (
        <Card title="部署脚本">
          <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
            <Text code style={{ color: '#d4d4d4' }}>{pipeline.deployScript}</Text>
          </pre>
        </Card>
      )}

      <Card title="环境变量">
        {Object.keys(pipeline.variables).length > 0 ? (
          <Descriptions bordered size="small">
            {Object.entries(pipeline.variables).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>{value}</Descriptions.Item>
            ))}
          </Descriptions>
        ) : (
          <div style={{ color: '#888', textAlign: 'center', padding: 24 }}>
            暂无环境变量
          </div>
        )}
      </Card>

      <Card title={`运行历史 (${runs.length})`}>
        <Table
          columns={runColumns}
          dataSource={runs}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 次运行` }}
        />
      </Card>
    </Space>
  );
}

export default PipelineDetail;
