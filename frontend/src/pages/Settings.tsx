import React from 'react'
import { Card, Tabs, Form, Input, Button, Select, Switch, message, Typography, Divider, Space, Tag, Empty } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import { SaveOutlined, DeleteOutlined, ExportOutlined, SettingOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const Settings: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { currentProject, updateProject, deleteProject } = useProjectStore()
  const [form] = Form.useForm()

  const tabItems = [
    {
      key: 'general',
      label: '基本设置',
    },
    {
      key: 'issue-types',
      label: '事项类型',
    },
    {
      key: 'workflows',
      label: '工作流',
    },
    {
      key: 'custom-fields',
      label: '自定义字段',
    },
    {
      key: 'permissions',
      label: '权限设置',
    },
    {
      key: 'members',
      label: '成员管理',
    },
    {
      key: 'advanced',
      label: '高级设置',
    },
  ]

  const handleSubmit = async (values: {
    name: string
    key: string
    description?: string
    category: string
    isPublic: boolean
    leadId?: string
  }) => {
    if (currentProject) {
      const success = await updateProject(currentProject.id, {
        name: values.name,
        key: values.key,
        description: values.description,
        category: values.category as 'software' | 'business' | 'ops',
        isPublic: values.isPublic,
        leadId: values.leadId,
      })
      if (success) {
        message.success('项目设置已保存')
      }
    }
  }

  const handleDelete = () => {
    if (currentProject) {
      deleteProject(currentProject.id)
      navigate('/projects')
      message.success('项目已删除')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>项目设置</Title>
        <Text type="secondary">配置项目的各项参数和选项</Text>
      </div>

      <Card>
        <Tabs defaultActiveKey="general" items={tabItems}>
          <Tabs.TabPane tab="基本设置" key="general">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                name: currentProject?.name,
                key: currentProject?.key,
                description: currentProject?.description,
                category: currentProject?.category || 'software',
                isPublic: currentProject?.isPublic || false,
                leadId: currentProject?.leadId,
              }}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                name="name"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>

              <Form.Item
                name="key"
                label="项目标识"
                rules={[
                  { required: true, message: '请输入项目标识' },
                  { pattern: /^[A-Z]+$/, message: '项目标识只能包含大写字母' },
                ]}
              >
                <Input placeholder="请输入项目标识（大写字母）" maxLength={10} />
              </Form.Item>

              <Form.Item
                name="description"
                label="项目描述"
              >
                <TextArea rows={4} placeholder="请输入项目描述" />
              </Form.Item>

              <Form.Item
                name="category"
                label="项目类型"
              >
                <Select placeholder="请选择项目类型">
                  <Option value="software">软件项目</Option>
                  <Option value="business">业务项目</Option>
                  <Option value="ops">运维项目</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="isPublic"
                label="公开项目"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    保存设置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="事项类型" key="issue-types">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="事项类型配置功能开发中..."
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="工作流" key="workflows">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="工作流配置功能开发中..."
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="自定义字段" key="custom-fields">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="自定义字段配置功能开发中..."
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="权限设置" key="permissions">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="权限设置功能开发中..."
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="成员管理" key="members">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="成员管理功能开发中..."
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="高级设置" key="advanced">
            <Card type="inner" title="危险操作" style={{ borderColor: '#ff4d4f' }}>
              <Text type="danger">
                删除项目将永久删除所有相关数据，包括事项、评论、附件等。此操作不可恢复。
              </Text>
              <Divider />
              <Space>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  删除项目
                </Button>
                <Button
                  icon={<ExportOutlined />}
                >
                  导出项目数据
                </Button>
              </Space>
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default Settings
