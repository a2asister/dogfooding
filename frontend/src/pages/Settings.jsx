import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Tabs,
  Divider,
  Modal,
  List,
  Switch,
  Select
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'
import styled from 'styled-components'

const { TabPane } = Tabs
const { Password } = Input

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  max-width: 600px;
`

const Settings = () => {
  const { user, getCurrentUser } = useAuthStore()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    deviceOffline: true,
    securityAlert: true,
    energyAlert: true,
    dailyReport: false
  })
  
  const handleProfileSubmit = async (values) => {
    try {
      setLoading(true)
      message.success('个人信息更新成功')
    } catch (error) {
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }
  
  const handlePasswordSubmit = async (values) => {
    try {
      setLoading(true)
      
      const result = await authApi.changePassword(values.oldPassword, values.newPassword)
      
      if (result.success) {
        message.success('密码修改成功')
        passwordForm.resetFields()
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('密码修改失败')
    } finally {
      setLoading(false)
    }
  }
  
  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }))
    message.success('设置已保存')
  }
  
  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> 个人信息
        </span>
      ),
      children: (
        <StyledCard title="个人信息设置">
          <Form
            form={profileForm}
            layout="vertical"
            initialValues={{
              username: user?.username,
              email: user?.email
            }}
            onFinish={handleProfileSubmit}
          >
            <Form.Item
              name="username"
              label="用户名"
            >
              <Input prefix={<UserOutlined />} disabled />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            
            <Form.Item
              name="role"
              label="角色"
            >
              <Input 
                value={user?.role === 'admin' ? '管理员' : user?.role === 'user' ? '普通用户' : '访客'} 
                disabled 
              />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </StyledCard>
      )
    },
    {
      key: 'password',
      label: (
        <span>
          <LockOutlined /> 密码设置
        </span>
      ),
      children: (
        <StyledCard title="修改密码">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}
          >
            <Form.Item
              name="oldPassword"
              label="当前密码"
              rules={[
                { required: true, message: '请输入当前密码' }
              ]}
            >
              <Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
            </Form.Item>
            
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Password prefix={<LockOutlined />} placeholder="请输入新密码" />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  }
                })
              ]}
            >
              <Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </StyledCard>
      )
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> 通知设置
        </span>
      ),
      children: (
        <StyledCard title="通知偏好设置">
          <List
            dataSource={[
              {
                title: '设备离线通知',
                description: '当设备离线时发送通知',
                key: 'deviceOffline'
              },
              {
                title: '安防告警通知',
                description: '当有安防告警时发送通知',
                key: 'securityAlert'
              },
              {
                title: '能耗异常通知',
                description: '当能耗异常时发送通知',
                key: 'energyAlert'
              },
              {
                title: '每日能耗报告',
                description: '每日发送能耗统计报告',
                key: 'dailyReport'
              }
            ]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Switch
                    checked={notifications[item.key]}
                    onChange={(checked) => handleNotificationChange(item.key, checked)}
                  />
                ]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </StyledCard>
      )
    },
    {
      key: 'system',
      label: (
        <span>
          <SettingOutlined /> 系统设置
        </span>
      ),
      children: (
        <StyledCard title="系统信息">
          <List>
            <List.Item>
            <List.Item.Meta
              title="系统版本"
              description="智能家居管理系统 v1.0.0"
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title="前端框架"
              description="React 18 + Vite + Ant Design"
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title="后端框架"
              description="Koa 2 + MySQL + Docker"
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title="支持功能"
              description="设备管理、场景控制、定时任务、告警中心、能耗统计"
            />
          </List.Item>
        </List>
        
        <Divider />
        
        <div style={{ display: 'flex', gap: 16 }}>
          <Button type="default">
            检查更新
          </Button>
          <Button type="default" danger>
            清除缓存
          </Button>
        </div>
      </StyledCard>
      )
    }
  ]
  
  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>
        系统设置
      </h2>
      
      <Tabs items={tabItems} defaultActiveKey="profile" />
    </div>
  )
}

export default Settings