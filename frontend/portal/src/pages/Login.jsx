import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, token, user } = useAuthStore();
  
  const isAuthenticated = useMemo(() => {
    return !!token && !!user;
  }, [token, user]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate, isAuthenticated]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.username, values.password);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        login(token, user);
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-title">
          <h1>统一登录门户</h1>
          <p>请输入您的账号密码进行登录</p>
        </div>
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
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

        <div style={{ textAlign: 'center', color: '#999', fontSize: '12px', marginTop: '20px' }}>
          <p>测试账号：</p>
          <p>管理员: admin / 123456</p>
          <p>数据分析师: data-analyst / 123456</p>
          <p>内容编辑: content-editor / 123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
