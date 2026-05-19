import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Space, Avatar, Tabs, Table, Modal, message } from 'antd'
import { UserOutlined, EditOutlined, LockOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAuthStore } from '@/store/auth'
import { authApi, logApi } from '@/services'
import { roleLabels, roleColors } from '@/utils/permission'
import type { LoginLog } from '@/types'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [editing, setEditing] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([])
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsPage, setLogsPage] = useState(1)
  const [logsLoading, setLogsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user)
    }
    loadLoginLogs()
  }, [user, logsPage])

  const loadLoginLogs = async () => {
    setLogsLoading(true)
    try {
      const res = await logApi.getMyLoginLogs({ page: logsPage, pageSize: 10 })
      const list = res.data.data.list.map((item: any) => ({
        ...item,
        userAgent: item.user_agent,
        loginTime: item.login_time
      }))
      setLoginLogs(list)
      setLogsTotal(res.data.data.total)
    } finally {
      setLogsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields()
      await authApi.updateProfile(values)
      updateUser(values)
      message.success('个人信息更新成功')
      setEditing(false)
    } catch {
      // error handled
    }
  }

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      await authApi.changePassword(values.oldPassword, values.newPassword)
      message.success('密码修改成功')
      setPasswordModalVisible(false)
      passwordForm.resetFields()
    } catch {
      // error handled
    }
  }

  const logColumns: ColumnsType<LoginLog> = [
    { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
    { title: '设备', dataIndex: 'device', key: 'device' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <span style={{ color: s === 'success' ? '#52c41a' : '#ff4d4f' }}>
          {s === 'success' ? '成功' : '失败'}
        </span>
      )
    },
    { title: '登录时间', dataIndex: 'loginTime', key: 'loginTime' }
  ]

  const tabItems = [
    {
      key: 'info',
      label: '基本信息',
      children: (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <Avatar size={80} src={user?.avatar} icon={<UserOutlined />} />
            <div style={{ marginLeft: 16 }}>
              <h2 style={{ margin: 0 }}>{user?.nickname || user?.username}</h2>
              <p style={{ color: '#999', margin: '8px 0 0 0' }}>
                <span style={{ marginRight: 16 }}>
                  <span style={{ color: roleColors[user?.role as keyof typeof roleColors] }}>
                    {roleLabels[user?.role as keyof typeof roleLabels]}
                  </span>
                </span>
                用户名: {user?.username}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Space>
                <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
                  编辑资料
                </Button>
                <Button icon={<LockOutlined />} onClick={() => setPasswordModalVisible(true)}>
                  修改密码
                </Button>
              </Space>
            </div>
          </div>

          <Form form={form} layout="vertical" disabled={!editing}>
            <div style={{ display: 'flex', gap: 24 }}>
              <Form.Item name="nickname" label="昵称" style={{ flex: 1 }}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="邮箱" style={{ flex: 1 }}>
                <Input />
              </Form.Item>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <Form.Item name="phone" label="电话" style={{ flex: 1 }}>
                <Input />
              </Form.Item>
              <Form.Item name="avatar" label="头像URL" style={{ flex: 1 }}>
                <Input />
              </Form.Item>
            </div>
            {editing && (
              <Space>
                <Button type="primary" onClick={handleSaveProfile}>保存</Button>
                <Button onClick={() => { setEditing(false); form.setFieldsValue(user) }}>取消</Button>
              </Space>
            )}
          </Form>
        </Card>
      )
    },
    {
      key: 'logs',
      label: '登录日志',
      children: (
        <Card>
          <Table
            rowKey="id"
            columns={logColumns}
            dataSource={loginLogs}
            loading={logsLoading}
            pagination={{
              current: logsPage,
              pageSize: 10,
              total: logsTotal,
              onChange: (p) => setLogsPage(p)
            }}
          />
        </Card>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">个人中心</h2>
      </div>

      <Tabs defaultActiveKey="info" items={tabItems} />

      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onOk={handleChangePassword}
        onCancel={() => setPasswordModalVisible(false)}
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password />
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
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
