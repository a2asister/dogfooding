import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Select,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useAuthStore, roleDescriptions } from '../stores/authStore';

const { Title, Text } = Typography;

const defaultAccounts = [
  { role: 'admin', username: 'admin', password: 'admin123', name: '系统管理员' },
  { role: 'medical', username: 'doctor1', password: 'doctor123', name: '张医生' },
  { role: 'medical', username: 'nurse1', password: 'nurse123', name: '王护士' },
  { role: 'charge', username: 'charge1', password: 'charge123', name: '赵收费' },
  { role: 'patient', username: 'patient1', password: 'patient123', name: '患者张三' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form] = Form.useForm();

  const handleQuickLogin = (account: (typeof defaultAccounts)[0]) => {
    form.setFieldsValue({
      username: account.username,
      password: account.password,
    });
  };

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const result = login(values.username, values.password);
      if (result.success) {
        setTimeout(() => {
          const { currentUser } = useAuthStore.getState();
          switch (currentUser?.role) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'medical':
              navigate('/medical/dashboard');
              break;
            case 'charge':
              navigate('/charge/dashboard');
              break;
            case 'patient':
              navigate('/patient/dashboard');
              break;
          }
        }, 500);
      } else {
        setError(result.message);
      }
    } catch {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && currentUser) {
    switch (currentUser.role) {
      case 'admin':
        navigate('/admin/dashboard');
        return null;
      case 'medical':
        navigate('/medical/dashboard');
        return null;
      case 'charge':
        navigate('/charge/dashboard');
        return null;
      case 'patient':
        navigate('/patient/dashboard');
        return null;
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          padding: '0 40px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <MedicineBoxOutlined
            style={{ fontSize: 80, color: 'white', marginBottom: 20 }}
          />
          <Title level={2} style={{ color: 'white', margin: 0, fontSize: 36 }}>
            医院管理系统
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginTop: 10, display: 'block' }}>
            Hospital Management System
          </Text>
        </div>

        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
            width: '100%',
          }}
          bodyStyle={{ padding: '48px 64px' }}
        >
          <Title level={3} style={{ textAlign: 'center', marginBottom: 32, fontSize: 24 }}>
            用户登录
          </Title>

          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />
          )}

          <Form
            form={form}
            onFinish={onFinish}
            size="large"
            initialValues={{ username: '', password: '' }}
            style={{ maxWidth: '500px', margin: '0 auto' }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                autoComplete="username"
                style={{ height: 48, fontSize: 16 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete="current-password"
                style={{ height: 48, fontSize: 16 }}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ height: 52, fontSize: 18 }}>
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={{ marginTop: 32, maxWidth: '500px', margin: '0 auto' }}>
            <Text type="secondary" style={{ marginBottom: 16, display: 'block', fontSize: 15 }}>
              快速登录（演示账号）：
            </Text>
            <Select
              size="large"
              style={{ width: '100%' }}
              placeholder="选择演示账号"
              onChange={(_, option) => {
                if (option && 'data' in option) {
                  handleQuickLogin(option.data as (typeof defaultAccounts)[0]);
                }
              }}
              options={defaultAccounts.map((account) => ({
                label: `${account.name} (${roleDescriptions[account.role]}) - ${account.username}`,
                value: account.username,
                data: account,
              }))}
              style={{ height: 48 }}
            />
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            © 2024 医院管理系统 - 所有操作日志可追溯
          </Text>
        </div>
      </div>
    </div>
  );
}
