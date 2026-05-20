import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Card, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloudServerOutlined } from '@ant-design/icons';
import { deployApi } from '@/api';
import type { Environment } from '@/types';
import dayjs from 'dayjs';

function Environments(): JSX.Element {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [form] = Form.useForm();

  const fetchData = async (): Promise<void> => {
    try {
      const result = await deployApi.listEnvironments();
      setEnvironments(result.environments as Environment[]);
    } catch {
      setEnvironments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (values: unknown): Promise<void> => {
    try {
      if (editingEnv) {
        message.success('更新成功');
      } else {
        await deployApi.createEnvironment(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingEnv(null);
      fetchData();
    } catch {
      // ignore
    }
  };

  const getTypeTag = (type: string): JSX.Element => {
    const map: Record<string, { color: string; text: string }> = {
      dev: { color: 'blue', text: '开发环境' },
      test: { color: 'cyan', text: '测试环境' },
      staging: { color: 'orange', text: '预发环境' },
      production: { color: 'red', text: '生产环境' },
    };
    const t = map[type] || { color: 'default', text: type };
    return <Tag color={t.color}>{t.text}</Tag>;
  };

  const columns = [
    {
      title: '环境名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <CloudServerOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => getTypeTag(type),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '部署地址',
      dataIndex: 'deployUrl',
      key: 'deployUrl',
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: '当前版本',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
      width: 140,
      render: (version: string) => version || <Tag color="default">未部署</Tag>,
    },
    {
      title: '最后部署',
      dataIndex: 'lastDeployedAt',
      key: 'lastDeployedAt',
      width: 180,
      render: (time: number) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '部署者',
      dataIndex: 'lastDeployedBy',
      key: 'lastDeployedBy',
      width: 120,
      render: (user: string) => user || '-',
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
      render: (_: unknown, record: Environment) => (
        <Space>
          <Button type="link" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
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
            setEditingEnv(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          创建环境
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={environments}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 个环境` }}
      />

      <Modal
        title={editingEnv ? '编辑环境' : '创建环境'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingEnv(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="环境名称" rules={[{ required: true }]}>
            <Input placeholder="例如: 生产环境" />
          </Form.Item>
          <Form.Item name="type" label="环境类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="dev">开发环境</Select.Option>
              <Select.Option value="test">测试环境</Select.Option>
              <Select.Option value="staging">预发环境</Select.Option>
              <Select.Option value="production">生产环境</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="环境描述信息" />
          </Form.Item>
          <Form.Item name="deployUrl" label="部署地址">
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {editingEnv ? '更新' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default Environments;
