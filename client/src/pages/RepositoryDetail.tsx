import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Spin, Tabs, Button, Form, Input, Modal, message, Space, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { repositoryApi, branchApi, deployApi } from '@/api';
import type { Repository, BranchRule, VersionSnapshot } from '@/types';
import dayjs from 'dayjs';

function RepositoryDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<BranchRule[]>([]);
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [snapshotModalVisible, setSnapshotModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [snapshotForm] = Form.useForm();

  const fetchData = async (): Promise<void> => {
    if (!id) return;
    try {
      const [repoResult, rulesResult, snapshotsResult] = await Promise.all([
        repositoryApi.get(id),
        repositoryApi.getBranchRules(id),
        repositoryApi.getSnapshots(id),
      ]);
      setRepo(repoResult.repo as Repository);
      setRules(rulesResult.rules as BranchRule[]);
      setSnapshots(snapshotsResult.snapshots as VersionSnapshot[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateRule = async (values: unknown): Promise<void> => {
    if (!id) return;
    try {
      await repositoryApi.createBranchRule(id, values);
      message.success('分支规则创建成功');
      setRuleModalVisible(false);
      form.resetFields();
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleCreateSnapshot = async (values: unknown): Promise<void> => {
    if (!id) return;
    try {
      await repositoryApi.createSnapshot(id, values);
      message.success('版本快照创建成功');
      setSnapshotModalVisible(false);
      snapshotForm.resetFields();
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleDeleteRule = (ruleId: string): void => {
    Modal.confirm({
      title: '确认删除',
      content: '确认删除此分支保护规则吗？',
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        await branchApi.deleteRule(ruleId);
        message.success('删除成功');
        fetchData();
      },
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!repo) {
    return <div>仓库不存在</div>;
  }

  const ruleColumns = [
    { title: '分支匹配', dataIndex: 'branchPattern', key: 'branchPattern' },
    { title: '审批人数', dataIndex: 'requiredApprovalCount', key: 'requiredApprovalCount' },
    {
      title: '需要CODEOWNER',
      dataIndex: 'requireCodeOwnerReview',
      key: 'requireCodeOwnerReview',
      render: (v: boolean) => (v ? <Tag color="green">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '需要解决对话',
      dataIndex: 'requireConversationResolution',
      key: 'requireConversationResolution',
      render: (v: boolean) => (v ? <Tag color="green">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: BranchRule) => (
        <Button type="link" danger onClick={() => handleDeleteRule(record.id)} icon={<DeleteOutlined />}>
          删除
        </Button>
      ),
    },
  ];

  const snapshotColumns = [
    { title: '版本号', dataIndex: 'version', key: 'version' },
    { title: '分支', dataIndex: 'branch', key: 'branch', render: (b: string) => <Tag color="blue">{b}</Tag> },
    { title: 'Commit', dataIndex: 'commitSha', key: 'commitSha', render: (sha: string) => sha.substring(0, 8) },
    { title: '提交信息', dataIndex: 'commitMessage', key: 'commitMessage', ellipsis: true },
    { title: '创建者', dataIndex: 'createdBy', key: 'createdBy' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (t: number) => dayjs(t).format('YYYY-MM-DD HH:mm') },
  ];

  const tabItems = [
    {
      key: 'rules',
      label: '分支保护规则',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setRuleModalVisible(true)}>
              添加规则
            </Button>
          </div>
          <Table
            columns={ruleColumns}
            dataSource={rules}
            rowKey="id"
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: 'snapshots',
      label: '版本快照',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setSnapshotModalVisible(true)}>
              创建快照
            </Button>
          </div>
          <Table
            columns={snapshotColumns}
            dataSource={snapshots}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Descriptions title={repo.fullName} column={2}>
          <Descriptions.Item label="描述">{repo.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="语言">{repo.language || '-'}</Descriptions.Item>
          <Descriptions.Item label="默认分支">
            <Tag color="blue">{repo.defaultBranch}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="可见性">
            <Tag color={repo.isPrivate ? 'orange' : 'green'}>{repo.isPrivate ? '私有' : '公开'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Star数">{repo.stars}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(repo.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Tabs items={tabItems} defaultActiveKey="rules" />
      </Card>

      <Modal
        title="添加分支保护规则"
        open={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRule}>
          <Form.Item
            name="branchPattern"
            label="分支匹配模式"
            rules={[{ required: true, message: '请输入分支匹配模式' }]}
          >
            <Input placeholder="例如: main, develop, release/*" />
          </Form.Item>
          <Form.Item
            name="requiredApprovalCount"
            label="需要审批人数"
            rules={[{ required: true, message: '请输入需要审批人数' }]}
          >
            <Input type="number" min={0} max={10} defaultValue={1} />
          </Form.Item>
          <Space>
            <Form.Item name="requireCodeOwnerReview" valuePropName="checked" initialValue={false}>
              <input type="checkbox" /> 需要CODEOWNER审批
            </Form.Item>
            <Form.Item name="requireConversationResolution" valuePropName="checked" initialValue={false}>
              <input type="checkbox" /> 需要解决所有对话
            </Form.Item>
          </Space>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="创建版本快照"
        open={snapshotModalVisible}
        onCancel={() => setSnapshotModalVisible(false)}
        footer={null}
      >
        <Form form={snapshotForm} layout="vertical" onFinish={handleCreateSnapshot}>
          <Form.Item name="version" label="版本号" rules={[{ required: true }]}>
            <Input placeholder="例如: v1.0.0" />
          </Form.Item>
          <Form.Item name="commitSha" label="Commit SHA" rules={[{ required: true }]}>
            <Input placeholder="提交的完整SHA" />
          </Form.Item>
          <Form.Item name="commitMessage" label="提交信息" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="提交的描述信息" />
          </Form.Item>
          <Form.Item name="branch" label="分支" rules={[{ required: true }]}>
            <Input placeholder="例如: main" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="版本变更描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              创建快照
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default RepositoryDetail;
