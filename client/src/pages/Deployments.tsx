import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Select, message, Card } from 'antd';
import { RollbackOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { deployApi, repositoryApi } from '@/api';
import type { Deployment, Repository, Environment } from '@/types';
import dayjs from 'dayjs';

function Deployments(): JSX.Element {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [envId, setEnvId] = useState<string>('');
  const [repoId, setRepoId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [deployModalVisible, setDeployModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async (): Promise<void> => {
    try {
      const [deployResult, repoResult, envResult] = await Promise.all([
        deployApi.listDeployments({
          page: 1,
          pageSize: 100,
          envId: envId || undefined,
          repoId: repoId || undefined,
          status: status || undefined,
        }),
        repositoryApi.list(),
        deployApi.listEnvironments(),
      ]);
      setDeployments(deployResult.deployments as Deployment[]);
      setRepos(repoResult.repos as Repository[]);
      setEnvironments(envResult.environments as Environment[]);
    } catch {
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [envId, repoId, status]);

  const handleRollback = (id: string): void => {
    Modal.confirm({
      title: '确认回滚',
      content: '确认将环境回滚到此版本吗？此操作需要管理员审批。',
      okText: '确认回滚',
      okType: 'danger',
      onOk: async () => {
        await deployApi.rollback(id);
        message.success('回滚请求已提交');
        fetchData();
      },
    });
  };

  const handleDeploy = async (values: unknown): Promise<void> => {
    try {
      await deployApi.deploy(values);
      message.success('部署请求已提交');
      setDeployModalVisible(false);
      form.resetFields();
      fetchData();
    } catch {
      // ignore
    }
  };

  const getStatusTag = (status: string): JSX.Element => {
    const map: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: '等待中' },
      running: { color: 'processing', text: '部署中' },
      success: { color: 'success', text: '成功' },
      failed: { color: 'error', text: '失败' },
      rolled_back: { color: 'warning', text: '已回滚' },
    };
    const t = map[status] || map.pending;
    return <Tag color={t.color}>{t.text}</Tag>;
  };

  const columns = [
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 160,
      render: (version: string) => <Tag color="blue">{version}</Tag>,
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
      title: '环境',
      dataIndex: 'envId',
      key: 'envId',
      width: 140,
      render: (id: string) => {
        const env = environments.find((e) => e.id === id);
        return env ? (
          <Tag color={env.type === 'production' ? 'red' : env.type === 'staging' ? 'orange' : 'blue'}>
            {env.name}
          </Tag>
        ) : (
          '-'
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => getStatusTag(s),
    },
    {
      title: 'Commit',
      dataIndex: 'commitSha',
      key: 'commitSha',
      width: 120,
      render: (sha: string) => <code>{sha.slice(0, 7)}</code>,
    },
    {
      title: '部署者',
      dataIndex: 'deployedBy',
      key: 'deployedBy',
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
      title: '完成时间',
      dataIndex: 'finishedAt',
      key: 'finishedAt',
      width: 180,
      render: (time: number) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Deployment) => (
        <Space>
          {record.status === 'success' && (
            <Button
              type="link"
              icon={<RollbackOutlined />}
              onClick={() => handleRollback(record.id)}
            >
              回滚
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Space wrap>
          <Select
            placeholder="选择环境"
            value={envId || undefined}
            onChange={setEnvId}
            style={{ width: 160 }}
            allowClear
          >
            {environments.map((env) => (
              <Select.Option key={env.id} value={env.id}>
                {env.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="选择仓库"
            value={repoId || undefined}
            onChange={setRepoId}
            style={{ width: 200 }}
            allowClear
          >
            {repos.map((repo) => (
              <Select.Option key={repo.id} value={repo.id}>
                {repo.fullName}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="部署状态"
            value={status || undefined}
            onChange={setStatus}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value="pending">等待中</Select.Option>
            <Select.Option value="running">部署中</Select.Option>
            <Select.Option value="success">成功</Select.Option>
            <Select.Option value="failed">失败</Select.Option>
            <Select.Option value="rolled_back">已回滚</Select.Option>
          </Select>
        </Space>
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          onClick={() => setDeployModalVisible(true)}
        >
          新建部署
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={deployments}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 次部署` }}
      />

      <Modal
        title="新建部署"
        open={deployModalVisible}
        onCancel={() => {
          setDeployModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleDeploy}>
          <Form.Item name="repoId" label="选择仓库" rules={[{ required: true }]}>
            <Select placeholder="选择要部署的仓库">
              {repos.map((repo) => (
                <Select.Option key={repo.id} value={repo.id}>
                  {repo.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="envId" label="目标环境" rules={[{ required: true }]}>
            <Select placeholder="选择部署环境">
              {environments.map((env) => (
                <Select.Option key={env.id} value={env.id}>
                  {env.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="version" label="版本号" rules={[{ required: true }]}>
            <Select placeholder="选择版本或快照">
              <Select.Option value="v1.0.0">v1.0.0</Select.Option>
              <Select.Option value="v1.1.0">v1.1.0</Select.Option>
              <Select.Option value="v2.0.0">v2.0.0</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              开始部署
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default Deployments;
