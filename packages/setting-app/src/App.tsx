import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Descriptions,
  Divider,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Radio,
  DatePicker,
  Badge,
  Tabs,
  Tooltip,
  List,
  TextArea,
  Switch,
  InputNumber,
  Upload,
  UploadFile,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
  SafetyOutlined,
  NotificationOutlined,
  GlobalOutlined,
  SaveOutlined,
  UploadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export interface Setting {
  id: string
  key: string
  value: string
  name: string
  description: string
  category: 'basic' | 'security' | 'notification' | 'interface' | 'log'
  type: 'string' | 'number' | 'boolean' | 'select' | 'text' | 'file'
  options?: { label: string; value: string }[]
  defaultValue: string
  createdAt: string
  updatedAt: string
}

const mockSettings: Setting[] = [
  { id: 's001', key: 'site.name', value: 'SaaS企业管理平台', name: '网站名称', description: '系统显示的网站名称', category: 'basic', type: 'string', defaultValue: 'SaaS管理系统', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's002', key: 'site.logo', value: '', name: '网站Logo', description: '系统Logo图片地址', category: 'basic', type: 'file', defaultValue: '', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's003', key: 'site.language', value: 'zh-CN', name: '默认语言', description: '系统默认显示语言', category: 'basic', type: 'select', options: [{ label: '简体中文', value: 'zh-CN' }, { label: 'English', value: 'en-US' }], defaultValue: 'zh-CN', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's004', key: 'security.session.timeout', value: '1800', name: '会话超时时间', description: '用户登录后超时自动登出时间（秒）', category: 'security', type: 'number', defaultValue: '1800', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's005', key: 'security.password.minLength', value: '6', name: '密码最小长度', description: '用户密码最小字符长度要求', category: 'security', type: 'number', defaultValue: '6', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's006', key: 'security.password.maxAttempts', value: '5', name: '登录失败次数', description: '登录失败次数超过限制将锁定账户', category: 'security', type: 'number', defaultValue: '5', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's007', key: 'security.ip.whitelist', value: '', name: 'IP白名单', description: '允许访问系统的IP地址列表，多个IP用逗号分隔，留空表示不限制', category: 'security', type: 'text', defaultValue: '', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's008', key: 'notification.email.enabled', value: 'true', name: '邮件通知', description: '是否启用邮件通知功能', category: 'notification', type: 'boolean', defaultValue: 'true', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's009', key: 'notification.sms.enabled', value: 'false', name: '短信通知', description: '是否启用短信通知功能', category: 'notification', type: 'boolean', defaultValue: 'false', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's010', key: 'notification.wechat.enabled', value: 'false', name: '企业微信通知', description: '是否启用企业微信通知功能', category: 'notification', type: 'boolean', defaultValue: 'false', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's011', key: 'log.operation.enabled', value: 'true', name: '操作日志', description: '是否记录用户操作日志', category: 'log', type: 'boolean', defaultValue: 'true', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 's012', key: 'log.operation.retention', value: '90', name: '操作日志保留天数', description: '操作日志自动清理保留天数', category: 'log', type: 'number', defaultValue: '90', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
]

const categoryConfig = {
  basic: { label: '基础设置', icon: <SettingOutlined />, color: 'blue' },
  security: { label: '安全设置', icon: <SafetyOutlined />, color: 'red' },
  notification: { label: '通知设置', icon: <NotificationOutlined />, color: 'orange' },
  interface: { label: '接口设置', icon: <GlobalOutlined />, color: 'purple' },
  log: { label: '日志设置', icon: <ClockCircleOutlined />, color: 'green' },
}

const App: React.FC<{ routerBase?: string }> = () => {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('basic')
  const [form] = Form.useForm()
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set())

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3010/api/settings`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setSettings(data.data || mockSettings)
      } else {
        setSettings(mockSettings)
      }
    } catch (error) {
      setSettings(mockSettings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleValueChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => 
      s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s
    ))
    setChangedKeys(prev => new Set(prev).add(key))
  }

  const handleSave = () => {
    if (changedKeys.size === 0) {
      message.info('没有需要保存的修改')
      return
    }
    setChangedKeys(new Set())
    message.success('保存成功')
  }

  const handleReset = () => {
    fetchData()
    setChangedKeys(new Set())
    message.info('已重置')
  }

  const getFilteredSettings = () => {
    return settings.filter(s => s.category === activeTab)
  }

  const renderSettingInput = (setting: Setting) => {
    const isChanged = changedKeys.has(setting.key)

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value === 'true'}
            onChange={(checked) => handleValueChange(setting.key, checked ? 'true' : 'false')}
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />
        )
      case 'number':
        return (
          <InputNumber
            value={parseInt(setting.value)}
            onChange={(value) => handleValueChange(setting.key, String(value || 0))}
            min={0}
            style={{ width: 200 }}
          />
        )
      case 'select':
        return (
          <Select
            value={setting.value}
            onChange={(value) => handleValueChange(setting.key, value)}
            style={{ width: 200 }}
          >
            {setting.options?.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        )
      case 'text':
        return (
          <Input.TextArea
            value={setting.value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            rows={3}
            style={{ width: 400 }}
            placeholder={setting.description}
          />
        )
      case 'file':
        return (
          <Space>
            <Upload>
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
            {setting.value && (
              <Tag color="blue">{setting.value}</Tag>
            )}
          </Space>
        )
      default:
        return (
          <Input
            value={setting.value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            style={{ width: 300 }}
            placeholder={setting.description}
          />
        )
    }
  }

  const filteredSettings = getFilteredSettings()
  const totalCount = settings.length
  const basicCount = settings.filter(s => s.category === 'basic').length
  const securityCount = settings.filter(s => s.category === 'security').length
  const notificationCount = settings.filter(s => s.category === 'notification').length

  const tabItems = [
    { key: 'basic', label: '基础设置', icon: <SettingOutlined /> },
    { key: 'security', label: '安全设置', icon: <SafetyOutlined /> },
    { key: 'notification', label: '通知设置', icon: <NotificationOutlined /> },
    { key: 'log', label: '日志设置', icon: <ClockCircleOutlined /> },
  ]

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="总配置项"
                    value={totalCount}
                    prefix={<SettingOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="基础配置"
                    value={basicCount}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<SettingOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="安全配置"
                    value={securityCount}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<SafetyOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="通知配置"
                    value={notificationCount}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<NotificationOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="系统设置"
              bordered={false}
              extra={
                <Space>
                  {changedKeys.size > 0 && (
                    <Tag color="orange">
                      已修改 {changedKeys.size} 项
                    </Tag>
                  )}
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    重置
                  </Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                    保存
                  </Button>
                </Space>
              }
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                style={{ marginBottom: 24 }}
              />

              <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                  {filteredSettings.map(setting => {
                    const isChanged = changedKeys.has(setting.key)
                    const config = categoryConfig[setting.category as keyof typeof categoryConfig]
                    
                    return (
                      <Col span={24} key={setting.id}>
                        <Card
                          size="small"
                          style={{
                            borderLeft: `4px solid ${
                              isChanged ? '#faad14' :
                              setting.type === 'boolean' && setting.value === 'true' ? '#52c41a' :
                              '#d9d9d9'
                            }`,
                          }}
                        >
                          <Row align="middle">
                            <Col flex="none" style={{ width: 280 }}>
                              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                                <Space>
                                  {setting.name}
                                  {isChanged && <Tag color="orange">已修改</Tag>}
                                </Space>
                              </div>
                              <div style={{ fontSize: 12, color: '#999' }}>
                                {setting.description}
                              </div>
                              <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 4 }}>
                                键: {setting.key}
                              </div>
                            </Col>
                            <Col flex="auto">
                              <Space align="center">
                                {renderSettingInput(setting)}
                                {setting.defaultValue !== setting.value && (
                                  <Tooltip title={`默认值: ${setting.defaultValue || '(空)'}`}>
                                    <Tag color="default" style={{ cursor: 'pointer' }}>
                                      已修改默认
                                    </Tag>
                                  </Tooltip>
                                )}
                              </Space>
                            </Col>
                            <Col flex="none" style={{ width: 180, textAlign: 'right' }}>
                              <Space>
                                <Tag color={config?.color || 'default'}>
                                  {config?.label}
                                </Tag>
                                <Tag>
                                  {setting.type === 'boolean' ? '开关' :
                                   setting.type === 'number' ? '数字' :
                                   setting.type === 'select' ? '选择' :
                                   setting.type === 'text' ? '多行' :
                                   setting.type === 'file' ? '文件' :
                                   '文本'}
                                </Tag>
                              </Space>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                    )
                  })}
                </Row>

                {filteredSettings.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                    <SettingOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <p>暂无配置项</p>
                  </div>
                )}
              </Spin>
            </Card>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="配置分类" bordered={false}>
                  <List
                    dataSource={Object.entries(categoryConfig)}
                    renderItem={([key, config]) => {
                      const count = settings.filter(s => s.category === key).length
                      return (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<span style={{ color: config.color }}>{config.icon}</span>}
                            title={
                              <Space>
                                <span>{config.label}</span>
                                <Tag color={config.color}>{count} 项</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )
                    }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="快捷操作" bordered={false}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button block size="large" onClick={() => setActiveTab('basic')}>
                      <SettingOutlined /> 基础设置
                    </Button>
                    <Button block size="large" onClick={() => setActiveTab('security')}>
                      <SafetyOutlined /> 安全设置
                    </Button>
                    <Button block size="large" onClick={() => setActiveTab('notification')}>
                      <NotificationOutlined /> 通知设置
                    </Button>
                    <Button block size="large" onClick={handleSave} type="primary">
                      <SaveOutlined /> 保存所有修改
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
