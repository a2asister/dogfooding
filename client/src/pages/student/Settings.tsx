import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Tabs, List, Tag, message, Divider } from 'antd';
import { SettingOutlined, LockOutlined, PhoneOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { authApi, studentApi } from '../../api';
import { LoginRecord } from '../../types';

const { Password } = Input;

const Settings: React.FC = () => {
  const [passwordForm] = Form.useForm();
  const [phoneForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLoginRecords();
  }, []);

  const loadLoginRecords = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getLoginRecords();
      setLoginRecords(data || []);
    } catch (error) {
      console.error('加载登录记录失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    try {
      await authApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error) {
      console.error('修改密码失败', error);
    }
  };

  const handleBindPhone = (_values: any) => {
    message.success('手机号绑定成功');
    phoneForm.resetFields();
  };

  const handleBindEmail = (_values: any) => {
    message.success('邮箱绑定成功');
    emailForm.resetFields();
  };

  const passwordItems = [
    {
      key: 'password',
      label: '修改密码',
      children: (
        <Card size="small">
          <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
            <Form.Item
              label="原密码"
              name="oldPassword"
              rules={[{ required: true, message: '请输入原密码' }]}
            >
              <Password prefix={<LockOutlined />} placeholder="请输入原密码" />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度不能少于6位' },
              ]}
            >
              <Password prefix={<LockOutlined />} placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              rules={[{ required: true, message: '请再次输入新密码' }]}
            >
              <Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'bind',
      label: '账号绑定',
      children: (
        <Card size="small">
          <Form form={phoneForm} layout="vertical" onFinish={handleBindPhone} style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
              <PhoneOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <div>
                <div style={{ fontWeight: '500' }}>绑定手机</div>
                <div style={{ color: '#999', fontSize: '13px' }}>当前未绑定</div>
              </div>
            </div>
            <Form.Item
              label="手机号"
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item
              label="验证码"
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <Input placeholder="请输入验证码" style={{ flex: 1 }} />
                <Button>获取验证码</Button>
              </div>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                绑定手机
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <Form form={emailForm} layout="vertical" onFinish={handleBindEmail}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
              <MailOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
              <div>
                <div style={{ fontWeight: '500' }}>绑定邮箱</div>
                <div style={{ color: '#999', fontSize: '13px' }}>当前未绑定</div>
              </div>
            </div>
            <Form.Item
              label="邮箱地址"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入正确的邮箱地址' },
              ]}
            >
              <Input placeholder="请输入邮箱地址" />
            </Form.Item>
            <Form.Item
              label="验证码"
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <Input placeholder="请输入验证码" style={{ flex: 1 }} />
                <Button>获取验证码</Button>
              </div>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                绑定邮箱
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: '安全设置',
      children: (
        <Card size="small">
          <List
            dataSource={[
              { title: '登录保护', desc: '开启后，在新设备登录需要验证', status: true },
              { title: '操作日志', desc: '记录您的敏感操作', status: true },
              { title: '异常登录提醒', desc: '检测到异常登录时发送短信通知', status: true },
            ]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type={item.status ? 'primary' : 'default'} size="small">
                    {item.status ? '已开启' : '去开启'}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<SafetyOutlined style={{ fontSize: '20px', color: '#722ed1' }} />}
                  title={item.title}
                  description={item.desc}
                />
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: 'records',
      label: '登录记录',
      children: (
        <Card size="small" extra={<Button onClick={loadLoginRecords}>刷新</Button>}>
          <List
            loading={loading}
            dataSource={loginRecords}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Tag color="green">登录成功</Tag>
                      <span>IP: {item.ipAddress}</span>
                    </div>
                  }
                  description={
                    <div style={{ color: '#999', fontSize: '13px' }}>
                      登录时间：{item.loginTime}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Card
        className="card-shadow"
        title={<><SettingOutlined /> 账号安全</>}
      >
        <Tabs items={passwordItems} />
      </Card>
    </div>
  );
};

export default Settings;
