import React from 'react';
import { Button, Card, Typography, Layout } from 'antd';
import { useRouter } from 'next/router';

const { Title } = Typography;
const { Content } = Layout;

export default function Home() {
  const router = useRouter();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '50px', textAlign: 'center' }}>
        <Card style={{ maxWidth: 600, margin: '0 auto' }}>
          <Title level={2}>调查问卷系统</Title>
          <p>欢迎使用调查问卷系统，您可以在这里创建和填写问卷。</p>
          <div style={{ marginTop: 20 }}>
            <Button type="primary" size="large" style={{ marginRight: 10 }} onClick={() => router.push('/login')}>
              登录
            </Button>
            <Button size="large" onClick={() => router.push('/register')}>
              注册
            </Button>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}