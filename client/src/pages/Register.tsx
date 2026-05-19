import { Form, Input, Button, Card, Typography, message, Radio } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/useStore';
import { User, UserRole } from '../types';

const { Title } = Typography;

function Register(): JSX.Element {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [form] = Form.useForm();

  const onFinish = async (values: { 
    phone: string; 
    password: string; 
    nickname: string;
    role: string;
  }): Promise<void> => {
    try {
      const res = await authApi.register(values) as unknown as { token: string; user: User };
      setToken(res.token);
      setUser(res.user);
      message.success('注册成功');
      navigate('/');
    } catch {
      // Error handled in interceptor
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>🏷️ 账户注册</Title>
          <p style={{ color: '#666', marginTop: 8 }}>创建您的拍卖账户</p>
        </div>
        
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="role"
            label="注册身份"
            initialValue={UserRole.USER}
          >
            <Radio.Group>
              <Radio value={UserRole.USER}>普通用户</Radio>
              <Radio value={UserRole.MERCHANT}>商家用户</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="nickname"
            rules={[
              { required: true, message: '请输入昵称' },
              { min: 2, max: 20, message: '昵称长度为2-20个字符' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input prefix={<MobileOutlined />} placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                }
              })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ height: 44 }}>
              注 册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            已有账号？<Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Register;
