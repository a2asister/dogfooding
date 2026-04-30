import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Typography, Layout, message, Modal, Form, Input, Select, DatePicker } from 'antd';
import { useRouter } from 'next/router';
import axios from 'axios';

const { Title } = Typography;
const { Content, Sider } = Layout;
const { Option } = Select;
const { TextArea } = Input;

interface Survey {
  id: number;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function Dashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.API_URL}/surveys`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSurveys(response.data);
    } catch (error) {
      message.error('获取问卷列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async (values: any) => {
    try {
      await axios.post(`${process.env.API_URL}/surveys`, values, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      message.success('问卷创建成功');
      setModalVisible(false);
      form.resetFields();
      fetchSurveys();
    } catch (error) {
      message.error('问卷创建失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Survey) => (
        <div>
          <Button type="primary" style={{ marginRight: 10 }} onClick={() => router.push(`/survey/${record.id}`)}>
            编辑
          </Button>
          <Button onClick={() => router.push(`/survey/${record.id}/responses`)}>
            查看结果
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#f0f2f5' }}>
        <div style={{ padding: '20px', fontSize: '18px', fontWeight: 'bold' }}>调查问卷系统</div>
        <div style={{ padding: '20px' }}>
          <Button type="primary" block onClick={() => setModalVisible(true)}>
            创建问卷
          </Button>
        </div>
        <div style={{ padding: '20px', position: 'absolute', bottom: 0, width: '100%' }}>
          <Button block onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </Sider>
      <Layout>
        <Content style={{ padding: '20px' }}>
          <Title level={2}>我的问卷</Title>
          <Table columns={columns} dataSource={surveys} loading={loading} rowKey="id" />
        </Content>
      </Layout>

      <Modal
        title="创建问卷"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateSurvey}>
          <Form.Item
            name="title"
            rules={[{ required: true, message: '请输入问卷标题' }]}
          >
            <Input placeholder="问卷标题" />
          </Form.Item>
          <Form.Item
            name="description"
            rules={[{ required: true, message: '请输入问卷描述' }]}
          >
            <TextArea placeholder="问卷描述" rows={4} />
          </Form.Item>
          <Form.Item
            name="status"
            initialValue="active"
          >
            <Select placeholder="问卷状态">
              <Option value="active">激活</Option>
              <Option value="paused">暂停</Option>
              <Option value="closed">关闭</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="startDate"
          >
            <DatePicker style={{ width: '100%' }} placeholder="开始时间" />
          </Form.Item>
          <Form.Item
            name="endDate"
          >
            <DatePicker style={{ width: '100%' }} placeholder="结束时间" />
          </Form.Item>
          <Form.Item
            name="isPublic"
            initialValue={false}
          >
            <Select placeholder="是否公开">
              <Option value={true}>公开</Option>
              <Option value={false}>私有</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}