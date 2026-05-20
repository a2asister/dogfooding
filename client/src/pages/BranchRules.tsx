import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Card, Switch, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { repositoryApi, branchApi } from '@/api';
import type { BranchRule, Repository } from '@/types';
import dayjs from 'dayjs';

function BranchRules(): JSX.Element {
  const [rules, setRules] = useState<BranchRule[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<BranchRule | null>(null);
  const [validateName, setValidateName] = useState('');
  const [validateResult, setValidateResult] = useState<{ valid: boolean; pattern?: string; message?: string } | null>(null);
  const [form] = Form.useForm();

  const fetchData = async (): Promise<void> => {
    try {
      const [repoResult, rulesResult] = await Promise.all([
        repositoryApi.list(),
        repositoryApi.getBranchRules('all'),
      ]);
      setRepos(repoResult.repos as Repository[]);
      setRules(rulesResult.rules as BranchRule[]);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleValidateName = async (): Promise<void> => {
    if (!validateName.trim()) {
      message.warning('请输入分支名称');
      return;
    }
    const result = await branchApi.validateName(validateName);
    setValidateResult(result);
  };

  const handleSubmit = async (values: unknown): Promise<void> => {
    try {
      if (editingRule) {
        await branchApi.updateRule(editingRule.id, values);
        message.success('更新成功');
      } else {
        await repositoryApi.createBranchRule((values as { repoId: string }).repoId, values);
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingRule(null);
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleEdit = (rule: BranchRule): void => {
    setEditingRule(rule);
    form.setFieldsValue(rule);
    setModalVisible(true);
  };

  const handleDelete = (id: string): void => {
    Modal.confirm({
      title: '确认删除',
      content: '删除分支规则后，相关分支将不再受此规则保护，确认删除吗？',
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        await branchApi.deleteRule(id);
        message.success('删除成功');
        fetchData();
      },
    });
  };

  const columns = [
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
      title: '分支匹配规则',
      dataIndex: 'branchPattern',
      key: 'branchPattern',
      render: (pattern: string) => <Tag color="blue">{pattern}</Tag>,
    },
    {
      title: '需要审批人数',
      dataIndex: 'requiredApprovalCount',
      key: 'requiredApprovalCount',
      width: 140,
      render: (count: number) => (
        <Tag color={count > 0 ? 'orange' : 'green'}>
          {count > 0 ? `${count} 人` : '无需审批'}
        </Tag>
      ),
    },
    {
      title: 'CODEOWNER 审核',
      dataIndex: 'requireCodeOwnerReview',
      key: 'requireCodeOwnerReview',
      width: 140,
      render: (required: boolean) => (
        <Tag color={required ? 'red' : 'default'}>{required ? '需要' : '不需要'}</Tag>
      ),
    },
    {
      title: '会话解决',
      dataIndex: 'requireConversationResolution',
      key: 'requireConversationResolution',
      width: 120,
      render: (required: boolean) => (
        <Tag color={required ? 'purple' : 'default'}>{required ? '需要' : '不需要'}</Tag>
      ),
    },
    {
      title: 'CI 检查',
      dataIndex: 'requireStatusChecks',
      key: 'requireStatusChecks',
      render: (checks: string[]) => (
        <Space wrap>
          {checks.length > 0 ? (
            checks.map((check) => <Tag key={check} color="cyan">{check}</Tag>)
          ) : (
            <Tag color="default">无</Tag>
          )}
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
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: BranchRule) => (
        <Space>
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
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="分支名称校验">
        <Space.Compact style={{ width: '100%', maxWidth: 600 }}>
          <Input
            placeholder="输入分支名称进行校验，例如: feature/login-page"
            value={validateName}
            onChange={(e) => setValidateName(e.target.value)}
          />
          <Button type="primary" onClick={handleValidateName}>
            校验
          </Button>
        </Space.Compact>
        {validateResult && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 6, background: validateResult.valid ? '#f6ffed' : '#fff2f0' }}>
            {validateResult.valid ? (
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span style={{ color: '#52c41a' }}>分支名称符合规范</span>
                {validateResult.pattern && <Tag color="green">匹配规则: {validateResult.pattern}</Tag>}
              </Space>
            ) : (
              <Space>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                <span style={{ color: '#ff4d4f' }}>{validateResult.message || '分支名称不符合规范'}</span>
                {validateResult.pattern && <Tag color="red">期望规则: {validateResult.pattern}</Tag>}
              </Space>
            )}
          </div>
        )}
      </Card>

      <Card>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRule(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            创建分支规则
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条规则` }}
        />

        <Modal
          title={editingRule ? '编辑分支规则' : '创建分支规则'}
          open={modalVisible}
          width={600}
          onCancel={() => {
            setModalVisible(false);
            setEditingRule(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="repoId" label="关联仓库" rules={[{ required: true }]}>
              <Select placeholder="选择仓库">
                {repos.map((repo) => (
                  <Select.Option key={repo.id} value={repo.id}>
                    {repo.fullName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="branchPattern" label="分支匹配规则" rules={[{ required: true }]}>
              <Input placeholder="例如: main, feature/*, release/*, hotfix/*" />
            </Form.Item>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name="requiredApprovalCount" label="审批人数" rules={[{ required: true }]} style={{ flex: 1 }}>
                <InputNumber min={0} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <Form.Item name="requireCodeOwnerReview" label="需要 CODEOWNER 审核" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="requireConversationResolution" label="需要解决所有会话" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="requireStatusChecks" label="需要通过的 CI 检查">
              <Select mode="tags" placeholder="输入检查名称，例如: build, test, lint">
                <Select.Option value="build">build</Select.Option>
                <Select.Option value="test">test</Select.Option>
                <Select.Option value="lint">lint</Select.Option>
                <Select.Option value="security">security</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                {editingRule ? '更新' : '创建'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </Space>
  );
}

export default BranchRules;
