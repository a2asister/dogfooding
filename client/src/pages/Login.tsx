import { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { login } from '@/store/slices/authSlice';
import type { UserRole } from '@/types';

const { Option } = Select;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);
  const [role, setRole] = useState<UserRole>('student');

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const resultAction = await dispatch(
        login({ username: values.username, password: values.password })
      );

      if (login.fulfilled.match(resultAction)) {
        const userRole = resultAction.payload.user.role;

        const redirectPath = {
          admin: '/admin',
          teacher: '/teacher',
          student: '/student',
        }[userRole];

        message.success('登录成功');
        navigate(redirectPath);
      } else if (login.rejected.match(resultAction)) {
        message.error(resultAction.payload || '登录失败');
      }
    } catch {
      message.error('登录失败，请重试');
    }
  };

  return (
    <div className="login-container">
      <Card className="login-form-container">
        <h1 className="login-title">大学选修课填报系统</h1>
        <p className="login-subtitle">请选择角色并登录</p>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="role"
            initialValue={role}
          >
            <Select
              value={role}
              onChange={(value) => setRole(value)}
              style={{ marginBottom: 16 }}
            >
              <Option value="student">学生端</Option>
              <Option value="teacher">教师端</Option>
              <Option value="admin">管理员端</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 24 }}>
          <p>默认管理员账号: admin / admin123</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
