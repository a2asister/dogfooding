import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Card, InputNumber, Switch } from 'antd';
import { PlusOutlined, PlayCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { pipelineApi, repositoryApi } from '@/api';
import type { Pipeline, Repository } from '@/types';
import dayjs from 'dayjs';

function Pipelines(): JSX.Element {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [form] = Form.useForm();

  const fetchData = async (): Promise<void> => {
    try {
      const [pipelineResult, repoResult] = await Promise.all([
        pipelineApi.list({ page: 1, pageSize: 100 }),
        repositoryApi.list(),
      ]);
      setPipelines(pipelineResult.pipelines as Pipeline[]);
      setRepos(repoResult.repos as Repository[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (values: unknown): Promise<void> => {
    try {
      if (editingPipeline) {
        await pipelineApi.update(editingPipeline.id, values);
        message.success('更新成功');
      } else {
        await pipelineApi.create(values as never);
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingPipeline(null);
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleEdit = (pipeline: Pipeline): void => {
    setEditingPipeline(pipeline);
    form.setFieldsValue(pipeline);
    setModalVisible(true);
  };

  const handleDelete = (id: string): void => {
    Modal.confirm({
      title: '确认删除',
      content: '删除流水线将移除所有相关运行记录，确认删除吗？',
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        await pipelineApi.delete(id);
        message.success('删除成功');
        fetchData();
      },
    });
  };

  const handleRun = async (pipeline: Pipeline): Promise<void> => {
    Modal.confirm({
      title: '运行流水线',
      content: '确认立即运行此流水线吗？',
      onOk: async () => {
        await pipelineApi.run(pipeline.id, {
          repoId: pipeline.repoId,
          commitSha: 'abc123def456',
          commitMessage: '手动触发',
          branch: 'main',
        });
        message.success('流水线已启动');
        navigate(`/pipeline-runs`);
      },
    });
  };

  const columns = [
    {
      title: '流水线名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Pipeline) => (
        <Button type="link" onClick={() => navigate(`/pipelines/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: '仓库',
      dataIndex: 'repoId',
      key: 'repoId',
      render: (repoId: string) => {
        const repo = repos.find((r) => r.id === repoId);
        return repo?.fullName || '-';
      },
    },
    {
      title: '触发方式',
      dataIndex: 'triggerType',
      key: 'triggerType',
      render: (type: string) => {
        const map: Record<string, { color: string; text: string }> = {
          push: { color: 'blue', text: '代码推送' },
          pull_request: { color: 'purple', text: 'PR提交' },
          schedule: { color: 'orange', text: '定时触发' },
          manual: { color: 'green', text: '手动触发' },
        };
        const t = map[type];
        return t ? <Tag color={t.color}>{t.text}</Tag> : type;
      },
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 100,
    },
    {
      title: '环境',
      dataIndex: 'environment',
      key: 'environment',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: number) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Pipeline) => (
        <Space>
          <Button type="link" icon={<PlayCircleOutlined />} onClick={() => handleRun(record)}>
            运行
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingPipeline(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          创建流水线
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={pipelines}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条流水线` }}
      />

      <Modal
        title={editingPipeline ? '编辑流水线' : '创建流水线'}
        open={modalVisible}
        width={700}
        onCancel={() => {
          setModalVisible(false);
          setEditingPipeline(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="流水线名称" rules={[{ required: true }]}>
            <Input placeholder="例如: Node.js CI" />
          </Form.Item>
          <Form.Item name="repoId" label="关联仓库" rules={[{ required: true }]}>
            <Select placeholder="选择仓库">
              {repos.map((repo) => (
                <Select.Option key={repo.id} value={repo.id}>
                  {repo.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="triggerType" label="触发方式" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select>
                <Select.Option value="push">代码推送</Select.Option>
                <Select.Option value="pull_request">PR提交</Select.Option>
                <Select.Option value="schedule">定时触发</Select.Option>
                <Select.Option value="manual">手动触发</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="language" label="语言" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select>
                <Select.Option value="nodejs">Node.js</Select.Option>
                <Select.Option value="python">Python</Select.Option>
                <Select.Option value="java">Java</Select.Option>
                <Select.Option value="go">Go</Select.Option>
                <Select.Option value="rust">Rust</Select.Option>
                <Select.Option value="other">其他</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="environment" label="部署环境" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="dev">开发环境</Select.Option>
              <Select.Option value="test">测试环境</Select.Option>
              <Select.Option value="staging">预发环境</Select.Option>
              <Select.Option value="production">生产环境</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="branchPattern" label="分支匹配（可选）">
            <Input placeholder="例如: main, feature/*" />
          </Form.Item>
          <Form.Item name="buildScript" label="构建脚本" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder={`npm install\nnpm run build`} />
          </Form.Item>
          <Form.Item name="testScript" label="测试脚本（可选）">
            <Input.TextArea rows={3} placeholder="npm test" />
          </Form.Item>
          <Form.Item name="deployScript" label="部署脚本（可选）">
            <Input.TextArea rows={3} placeholder="npm run deploy" />
          </Form.Item>
          <Form.Item
            name="enableNotifications"
            label="启用通知"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {editingPipeline ? '更新' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default Pipelines;
