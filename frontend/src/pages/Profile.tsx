import React from 'react'
import { Card, Typography, Avatar, Row, Col, Statistic, Button, Form, Input, Upload, message, Divider, Tag, Empty, Select } from 'antd'
import {
  UserOutlined,
  EditOutlined,
  SettingOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  LogoutOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography
const { Option } = Select

const Profile: React.FC = () => {
  const { currentUser, logout, updateProfile } = useAuthStore()
  const { projects } = useProjectStore()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleFinish = (values: {
    displayName: string
    email: string
  }) => {
    if (currentUser) {
      updateProfile({
        displayName: values.displayName,
        email: values.email,
      })
      message.success('个人信息已更新')
    }
  }

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Empty description="请先登录" />
        <Button
          style={{ marginTop: 16 }}
          onClick={() => navigate('/login')}
        >
          去登录
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>个人中心</Title>
        <Text type="secondary">管理您的个人信息和偏好设置</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={currentUser.avatar}
              style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
            />
            <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
              {currentUser.displayName || currentUser.username}
            </Title>
            <Text type="secondary">@{currentUser.username}</Text>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic title="项目" value={projects.length} prefix={<ProjectOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="在线" value="现在" prefix={<ClockCircleOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="团队" value="1" prefix={<TeamOutlined />} />
              </Col>
            </Row>
            <Divider />
            <Button
              danger
              block
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="基本信息" extra={
            <Button type="link" icon={<EditOutlined />}>
              编辑
            </Button>
          }>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{
                displayName: currentUser.displayName || currentUser.username,
                email: currentUser.email,
                username: currentUser.username,
              }}
              style={{ maxWidth: 500 }}
            >
              <Form.Item
                name="username"
                label="用户名"
              >
                <Input disabled placeholder="用户名" />
              </Form.Item>

              <Form.Item
                name="displayName"
                label="显示名称"
                rules={[{ required: true, message: '请输入显示名称' }]}
              >
                <Input placeholder="请输入显示名称" />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              <Form.Item label="头像">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => {
                    message.info('头像上传功能开发中...')
                    return false
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存更改
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="偏好设置" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item label="语言">
                  <Select defaultValue="zh-CN" style={{ width: '100%' }}>
                    <Option value="zh-CN">简体中文</Option>
                    <Option value="en-US">English</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="主题">
                  <Select defaultValue="light" style={{ width: '100%' }}>
                    <Option value="light">浅色模式</Option>
                    <Option value="dark">深色模式</Option>
                    <Option value="system">跟随系统</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile
