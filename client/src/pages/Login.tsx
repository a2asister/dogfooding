import { useState } from 'react';
import { Form, Input, Button, Card, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('patient');
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      setToken(res.token);
      setUser(res.user);
      message.success('登录成功');
      if (res.user.role === 'patient') {
        navigate('/patient');
      } else if (res.user.role === 'doctor' || res.user.role === 'nurse') {
        navigate('/medical');
      } else {
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { key: 'patient', label: '患者' },
    { key: 'doctor', label: '医生' },
    { key: 'admin', label: '管理员' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">🏥 智慧医院</h1>
          <p className="text-gray-500">欢迎登录医院管理系统</p>
        </div>

        <Tabs
          activeKey={role}
          onChange={(key) => setRole(key as UserRole)}
          items={roleOptions}
          className="mb-4"
        />

        <Form name="login" onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名/手机号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名/手机号" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className="h-10">
              登录
            </Button>
          </Form.Item>
        </Form>

        {role === 'patient' && (
          <div className="text-center">
            还没有账号？<Link to="/register">立即注册</Link>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-400">
          <p>测试账号：admin / admin123（管理员）</p>
          <p>测试账号：doctor1 / 123456（医生）</p>
          <p>测试账号：patient1 / 123456（患者）</p>
        </div>
      </Card>
    </div>
  );
}
