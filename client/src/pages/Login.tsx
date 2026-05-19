import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api';
import { useAuthStore } from '../store/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/student/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: { studentId: string; password: string }) => {
    setLoading(true);
    try {
      const data = await authApi.login(values);
      login(data.token, data.user);
      message.success('登录成功');
      const from = (location.state as any)?.from?.pathname || '/student/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('登录失败', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        style={{ width: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
        title={
          <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: '600' }}>
            🎓 学生管理系统
          </div>
        }
      >
        <Form name="login" onFinish={onFinish} size="large">
          <Form.Item
            name="studentId"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入学号" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', color: '#999', fontSize: '13px', marginTop: '20px' }}>
          <p>测试账号：2024001001 / 123456</p>
          <Button type="link" onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
