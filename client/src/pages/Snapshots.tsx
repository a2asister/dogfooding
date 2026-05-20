import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Card, Avatar } from 'antd';
import { PlusOutlined, CloudDownloadOutlined, HistoryOutlined } from '@ant-design/icons';
import { repositoryApi } from '@/api';
import type { VersionSnapshot, Repository } from '@/types';
import dayjs from 'dayjs';

function Snapshots(): JSX.Element {
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [repoId, setRepoId] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async (): Promise<void> => {
    try {
      const [repoResult, snapshotResult] = await Promise.all([
        repositoryApi.list(),
        repoId ? repositoryApi.getSnapshots(repoId) : { snapshots: [] },
      ]);
      setRepos(repoResult.repos as Repository[]);
      setSnapshots(snapshotResult.snapshots as VersionSnapshot[]);
    } catch {
      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [repoId]);

  const handleCreate = async (values: unknown): Promise<void> => {
    if (!repoId) return;
    try {
      await repositoryApi.createSnapshot(repoId, values);
      message.success('快照创建成功');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch {
      // ignore
    }
  };

  const columns = [
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 140,
      render: (version: string) => (
        <Tag color="geekblue" icon={<HistoryOutlined />}>
          {version}
        </Tag>
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
      title: 'Commit',
      dataIndex: 'commitSha',
      key: 'commitSha',
      width: 120,
      render: (sha: string) => <code>{sha.slice(0, 7)}</code>,
    },
    {
      title: '提交信息',
      dataIndex: 'commitMessage',
      key: 'commitMessage',
      ellipsis: true,
    },
    {
      title: '分支',
      dataIndex: 'branch',
      key: 'branch',
      width: 120,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map((tag) => (
            <Tag key={tag} color="cyan">
              {tag}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '创建者',
      key: 'createdBy',
      width: 120,
      render: (_: unknown, record: VersionSnapshot) => (
        <Space>
          <Avatar size={24}>
            {record.createdBy?.[0]?.toUpperCase()}
          </Avatar>
          <span>{record.createdBy}</span>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: VersionSnapshot) => (
        <Space>
          {record.artifactUrl && (
            <Button
              type="link"
              icon={<CloudDownloadOutlined />}
              href={record.artifactUrl}
              target="_blank"
            >
              下载
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Select
          placeholder="选择仓库查看快照"
          value={repoId || undefined}
          onChange={setRepoId}
          style={{ width: 300 }}
          allowClear
        >
          {repos.map((repo) => (
            <Select.Option key={repo.id} value={repo.id}>
              {repo.fullName}
            </Select.Option>
          ))}
        </Select>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          disabled={!repoId}
        >
          创建快照
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={snapshots}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 个快照` }}
      />

      <Modal
        title="创建版本快照"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="version" label="版本号" rules={[{ required: true }]}>
            <Input placeholder="例如: v1.2.0" />
          </Form.Item>
          <Form.Item name="commitSha" label="Commit SHA" rules={[{ required: true }]}>
            <Input placeholder="完整的 Git Commit SHA" />
          </Form.Item>
          <Form.Item name="commitMessage" label="提交信息">
            <Input placeholder="本次提交的说明" />
          </Form.Item>
          <Form.Item name="branch" label="分支">
            <Input placeholder="例如: main" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="添加标签，例如: release, stable">
              <Select.Option value="release">release</Select.Option>
              <Select.Option value="stable">stable</Select.Option>
              <Select.Option value="hotfix">hotfix</Select.Option>
              <Select.Option value="feature">feature</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="版本快照的详细描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              创建快照
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default Snapshots;
