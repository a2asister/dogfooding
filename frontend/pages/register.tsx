import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography, Layout, message } from 'antd';
import { useRouter } from 'next/router';
import axios from 'axios';

const { Title } = Typography;
const { Content } = Layout;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await axios.post(`${process.env.API_URL}/auth/register`, {
        ...values,
        role: 'user',
      });
      message.success('注册成功，请登录');
      router.push('/login');
    } catch (error) {
      message.error('注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '50px', textAlign: 'center' }}>
        <Card style={{ maxWidth: 400, margin: '0 auto' }}>
          <Title level={2}>注册</Title>
          <Form
            name="register"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                注册
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}