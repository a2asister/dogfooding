import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Divider,
  Descriptions,
  Avatar,
  Tag,
  Modal,
  Space,
  List,
  Typography,
} from 'antd';
import {
  UserOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  LockOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/storage';
import { UserRole } from '../types';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
  const [passwordForm] = Form.useForm();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportData, setExportData] = useState('');

  const { currentUser, updateCurrentUser, isAdmin } = useAuth();

  const handlePasswordChange = (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }
    const userWithPassword = storage.getUserByIdWithPassword(currentUser!.id);
    if (!userWithPassword || userWithPassword.password !== values.oldPassword) {
      message.error('原密码错误');
      return;
    }
    updateCurrentUser({ password: values.newPassword });
    
    storage.addLog({
      userId: currentUser!.id,
      action: '修改',
      module: '系统设置',
      description: '修改了登录密码',
      details: {},
    });
    
    message.success('密码修改成功');
    passwordForm.resetFields();
  };

  const handleExportData = () => {
    if (!isAdmin) {
      message.error('权限不足，仅管理员可查看数据');
      return;
    }
    const data = storage.getSafeDataForExport();
    const jsonStr = JSON.stringify(data, null, 2);
    setExportData(jsonStr);
    setExportModalOpen(true);
  };

  const handleDownloadBackup = () => {
    if (!isAdmin) {
      message.error('权限不足，仅管理员可导出数据');
      return;
    }
    const data = storage.getSafeDataForExport();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family_finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    storage.addLog({
      userId: currentUser!.id,
      action: '导出',
      module: '系统设置',
      description: '导出了数据备份',
      details: {},
    });
    
    message.success('数据导出成功');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      message.error('权限不足，仅管理员可导入数据');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data && data.users && data.categories && data.accounts) {
          Modal.confirm({
            title: '确认导入数据',
            content: '导入数据将覆盖当前所有数据，此操作不可恢复，确定要继续吗？',
            okText: '确认导入',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
              storage.setData(data);
              
              storage.addLog({
                userId: currentUser!.id,
                action: '导入',
                module: '系统设置',
                description: '导入了数据备份',
                details: { fileName: file.name },
              });
              
              message.success('数据导入成功，请重新登录');
            },
          });
        } else {
          message.error('无效的数据格式');
        }
      } catch (error) {
        message.error('文件解析失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="settings-page">
      <Card title="个人信息">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="头像">
            <Avatar size={48} icon={<UserOutlined />} />
          </Descriptions.Item>
          <Descriptions.Item label="姓名">{currentUser?.name}</Descriptions.Item>
          <Descriptions.Item label="用户名">{currentUser?.username}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color={currentUser?.role === UserRole.ADMIN ? 'purple' : 'blue'}>
              {currentUser?.role === UserRole.ADMIN ? (
                <span><SafetyCertificateOutlined /> 管理员</span>
              ) : (
                <span><TeamOutlined /> 普通成员</span>
              )}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider />

      <Card title="修改密码">
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[
              { required: true, message: '请确认新密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <Card title="数据管理">
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              title: '查看数据',
              description: '查看当前所有数据的JSON格式',
              icon: <DatabaseOutlined />,
              action: (
                <Button type="primary" ghost onClick={handleExportData}>
                  查看
                </Button>
              ),
            },
            {
              title: '导出备份',
              description: '将所有数据导出为JSON文件进行备份',
              icon: <DownloadOutlined />,
              action: (
                <Button type="primary" onClick={handleDownloadBackup}>
                  导出备份
                </Button>
              ),
            },
            {
              title: '导入数据',
              description: '从备份文件恢复数据（将覆盖当前数据）',
              icon: <CloudUploadOutlined />,
              action: (
                <label className="ant-btn ant-btn-danger">
                  导入数据
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleImportData}
                  />
                </label>
              ),
            },
          ]}
          renderItem={(item) => (
            <List.Item actions={[item.action]}>
              <List.Item.Meta
                avatar={<span style={{ fontSize: 24, color: '#1890ff' }}>{item.icon}</span>}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="数据预览 (JSON)"
        open={exportModalOpen}
        onCancel={() => setExportModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setExportModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        <pre
          style={{
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 4,
            maxHeight: 500,
            overflow: 'auto',
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {exportData}
        </pre>
      </Modal>
    </div>
  );
};

export default Settings;
