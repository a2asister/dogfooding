import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Spin, Button, Space } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { pipelineApi } from '@/api';
import type { PipelineRun } from '@/types';
import dayjs from 'dayjs';

function PipelineRunDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRun = async (): Promise<void> => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await pipelineApi.getRun(id);
      setRun(result.run as PipelineRun);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRun();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!run) {
    return <div>运行记录不存在</div>;
  }

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

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <Button icon={<ReloadOutlined />} onClick={fetchRun}>
          刷新
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions title={`运行详情 - ${run.id.substring(0, 8)}`} column={2}>
          <Descriptions.Item label="状态">{getStatusTag(run.status)}</Descriptions.Item>
          <Descriptions.Item label="阶段">{run.stage}</Descriptions.Item>
          <Descriptions.Item label="分支">{run.branch}</Descriptions.Item>
          <Descriptions.Item label="Commit">{run.commitSha.substring(0, 8)}</Descriptions.Item>
          <Descriptions.Item label="触发者">{run.triggeredBy}</Descriptions.Item>
          <Descriptions.Item label="耗时">
            {run.duration ? `${(run.duration / 1000).toFixed(1)}s` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="开始时间">
            {dayjs(run.startedAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="结束时间">
            {run.finishedAt ? dayjs(run.finishedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="执行日志">
        <pre className="logs-container">{run.output || '暂无日志输出'}</pre>
      </Card>
    </div>
  );
}

export default PipelineRunDetail;
